import util from 'util'
import os from 'os'

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
        this.currentTest = null
        this.currentSuite = null

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

    processMessage (hookName, payload) {
        const params = { type: hookName, payload: payload }

        if (hookName === 'test:end') {
            this.lastError = this.lastError || payload.assertions.find(assertion => !assertion.passed)
            params.err = this.lastError
        } else if (hookName === 'suite:end') {
            params.err = this.lastError
            this.lastError = null
        }

        const message = this.formatMessage(params)

        if (hookName.startsWith('test')) {
            this.currentTest = message
        } else if (hookName.startsWith('suite')) {
            this.currentSuite = message
        }

        return message
    }

    formatMessage (params) {
        let message = {
            event: params.type,
            type: params.type
        }

        if (params.err) {
            let reason = `Actual value ${util.inspect(params.err.actual)} does not match expected value ${util.inspect(params.err.expected)}.`

            message.err = {
                message: `Description: ${params.err.message}` + os.EOL +
                         `Reason: ${reason}`,
                stack: params.err.stack,
                type: params.err.todo ? 'ToDo' : '',
                expected: params.err.expected,
                actual: params.err.actual
            }
        }

        if (params.payload) {
            message.title = params.payload.fullName.slice().reverse()[0]
            message.parent = params.payload.fullName.slice().reverse()[1]
            message.fullTitle = params.payload.fullName.join(' - ')
            message.pending = params.payload.status === 'skipped' || params.payload.status === 'todo'
            message.passed = params.payload.status === 'passed'
            message.duration = params.payload.runtime
            message.file = undefined

            // Add the current test title to the payload for cases where it helps to
            // identify the test, e.g. when running inside a beforeEach hook
            // message.currentTest = this.currentTest.title
        }

        return message
    }

    tagMessage (message) {
        message.pid = process.pid
        message.cid = this.adapter.cid
        message.specs = this.adapter.specs
        message.runner = {
            [this.adapter.cid]: this.adapter.capabilities
        }

        let {uid, parentUid} = this.generateUID(message)
        message.uid = uid
        message.parentUid = parentUid
    }

    emit (event, payload) {
        let message = this.processMessage(event, payload)

        this.tagMessage(message)

        // When starting a new test, propagate the details to the test runner so that
        // commands, results, screenshots and hooks can be associated with this test
        if (event === 'test:start') {
            this.sendInternal(event, message)
        // Send test:status message before test:end
        } else if (event === 'test:end') {
            if (message.pending) {
                message.event = message.type = 'test:pending'
            } else if (message.passed) {
                message.event = message.type = 'test:pass'
            } else {
                message.event = message.type = 'test:fail'
            }
            this.sendMessage(message)

            message.event = message.type = event
        }

        this.sendMessage(message)
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

    sendMessage (message) {
        // console.log('sending message', message)

        this.send(message, null, {}, () => ++this.receivedMessages)
        this.sentMessages++
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
