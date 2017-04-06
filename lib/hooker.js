import { runInFiberContext, wrapCommands, executeHooksWithArgs } from 'wdio-sync'

const TEST_COMMANDS = [
    'module',
    'test', 'todo', 'skip', 'only'
]

const QUNIT_HOOKS = {
    'moduleStart': 'beforeSuite',
    'testStart': 'beforeTest',
    'testDone': 'afterTest',
    'moduleDone': 'afterSuite'
}

const COMMANDS = [
    ...TEST_COMMANDS,
    ...Object.keys(QUNIT_HOOKS)
]

/**
 * QUnit hooker
 */
class QUnitHooker {
    constructor (adapter) {
        this.adapter = adapter
    }

    setupHooks () {
        // trigger before and after wdio config hooks
        wrapCommands(global.browser, this.adapter.config.beforeCommand, this.adapter.config.afterCommand)

        // wrap QUnit commands into fiber context
        COMMANDS.forEach((fnName) => {
            runInFiberContext(
                TEST_COMMANDS,
                this.adapter.config.beforeHook,
                this.adapter.config.afterHook,
                fnName,
                this.adapter.runner
            )
        })

        // let QUnit hooks trigger WDIO hooks
        Object.keys(QUNIT_HOOKS).forEach((hookName) => {
            this.adapter.runner[hookName](this.wrapHook(QUNIT_HOOKS[hookName]))
        })
    }

    async execStartHook () {
        executeHooksWithArgs(this.adapter.config.before, [this.adapter.capabilities, this.adapter.specs])
    }

    async execEndHook (result) {
        executeHooksWithArgs(this.adapter.config.after, [result, this.adapter.capabilities, this.adapter.specs])
    }

    wrapHook (hookName) {
        return (assert) => executeHooksWithArgs(
            this.adapter.config[hookName],
            assert
        ).catch((e) => {
            console.log(`Error in ${hookName} hook`, e.stack)
        })
    }
}

export default QUnitHooker
