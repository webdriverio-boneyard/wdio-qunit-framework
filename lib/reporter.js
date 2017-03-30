const REPORTER_EVENTS = {
    // 'runStart': 'start',
    'suiteStart': 'suite:start',
    'testStart': 'test:start',
    'testEnd': 'test:end',
    'suiteEnd': 'suite:end'
    // 'runEnd': 'end'
}

const SETTLE_TIMEOUT = 5000

/**
 * QUnit reporter
 */
class QUnitReporter {
    constructor (adapter) {
        this.adapter = adapter

        this.lastError = null

        this.sentMessages = 0 // number of messages sent to the parent
        this.receivedMessages = 0 // number of messages received by the parent
        this.messageCounter = 0
        this.messageUIDs = {
            suite: {},
            hook: {},
            test: {}
        }
    }

    setupEventListeners () {
        Object.keys(REPORTER_EVENTS).forEach((e) => {
            this.adapter.runner.on(e, this.emit.bind(this, REPORTER_EVENTS[e]))
        })
    }

    prepareMessage (hookName, payload) {
        const params = { type: hookName, payload: payload }

        // console.log('lastError', this.lastError)
        if (hookName === 'test:end') {
            this.lastError = this.lastError || payload.assertions.find(assertion => !assertion.passed)
            params.err = this.lastError
        } else if (hookName === 'suite:end') {
            params.err = this.lastError
            this.lastError = null
        }

        params.err = this.lastError
        return this.formatMessage(params)
    }

    formatMessage (params) {
        let message = {
            type: params.type
        }

        if (params.err) {
            message.err = {
                message: params.err.message,
                stack: params.err.stack,
                type: params.err.todo ? 'ToDo' : '',
                expected: params.err.expected,
                actual: params.err.actual
            }
        }

        if (params.payload) {
            message.title = params.payload.fullName[params.payload.fullName.length - 1]
            message.parent = params.payload.fullName[params.payload.fullName.length - 2]
            message.fullTitle = params.payload.fullName.join(' - ')
            message.pending = params.payload.status === 'skipped' || params.payload.status === 'todo' || false
            message.file = undefined

            // FIXME
            // Add the current test title to the payload for cases where it helps to
            // identify the test, e.g. when running inside a beforeEach hook
            if (params.payload.ctx && params.payload.ctx.currentTest) {
                message.currentTest = params.payload.ctx.currentTest.title
            }

            if (params.type.match(/Test/i)) {
                message.passed = (params.payload.status === 'passed')
                message.duration = params.payload.runtime
            }
        }

        // console.log('message', message)
        return message
    }

    emit (event, payload) {
        let message = this.prepareMessage(event, payload)

        message.cid = this.adapter.cid
        message.specs = this.adapter.specs
        message.event = event
        message.runner = {}
        message.runner[this.adapter.cid] = this.adapter.capabilities

        let {uid, parentUid} = this.generateUID(message)
        message.uid = uid
        message.parentUid = parentUid

        // When starting a new test, propagate the details to the test runner so that
        // commands, results, screenshots and hooks can be associated with this test
        if (event === 'test:start') {
            this.sendInternal(event, message)
        }

        this.send(message, null, {}, () => ++this.receivedMessages)
        this.sentMessages++
    }

    generateUID (message) {
        var uid, parentUid

        switch (message.type) {
        case 'suite:start':
            uid = this.getUID(message.title, 'suite', true)
            parentUid = uid
            break

        case 'suite:end':
            uid = this.getUID(message.title, 'suite')
            parentUid = uid
            break

        case 'hook:start':
            uid = this.getUID(message.title, 'hook', true)
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'hook:end':
            uid = this.getUID(message.title, 'hook')
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'test:start':
            uid = this.getUID(message.title, 'test', true)
            parentUid = this.getUID(message.parent, 'suite')
            break

        case 'test:pending':
        case 'test:end':
        case 'test:pass':
        case 'test:fail':
            uid = this.getUID(message.title, 'test')
            parentUid = this.getUID(message.parent, 'suite')
            break

        default:
            throw new Error(`Unknown message type : ${message.type}`)
        }

        return {
            uid,
            parentUid
        }
    }

    getUID (title, type, start) {
        if (start !== true && this.messageUIDs[type][title]) {
            return this.messageUIDs[type][title]
        }

        let uid = title + this.messageCounter++

        this.messageUIDs[type][title] = uid

        return uid
    }

    sendInternal (event, message) {
        process.emit(event, message)
    }

    /**
     * reset globals to rewire it out in tests
     */
    send (...args) {
        return process.send.apply(process, args)
    }

    /**
     * wait until all messages were sent to parent
     */
    waitUntilSettled () {
        return new Promise((resolve) => {
            const start = (new Date()).getTime()
            const interval = setInterval(() => {
                const now = (new Date()).getTime()

                if (this.sentMessages !== this.receivedMessages && now - start < SETTLE_TIMEOUT) return
                clearInterval(interval)
                resolve()
            }, 100)
        })
    }
}

export default QUnitReporter
