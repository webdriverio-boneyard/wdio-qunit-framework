import { runInFiberContext, wrapCommands, executeHooksWithArgs } from 'wdio-sync'

const TEST_COMMANDS = [
    'module',
    'test', 'todo', 'skip', 'only'
]

const COMMANDS = [
    // 'on',
    ...TEST_COMMANDS
]

const MODULE_HOOKS = {
    'before': 'beforeSuite',
    'beforeEach': 'beforeTest',
    'afterEach': 'afterTest',
    'after': 'afterSuite'
}

const NOOP = () => {}

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

        // wrap QUnit.module hooks
        const qunitModule = this.adapter.runner.module
        this.adapter.runner.module = (name, testEnvironment, executeNow) => {
            if (typeof testEnvironment !== 'function') {
                testEnvironment = testEnvironment || {}
                Object.keys(MODULE_HOOKS).forEach((hookName) => {
                    const origHook = testEnvironment[hookName] || NOOP
                    testEnvironment[hookName] = (assert) => {
                        return this.wrapHook(MODULE_HOOKS[hookName])(assert)
                                   .then(Promise.resolve(origHook))
                    }
                })
            } else {
                let origTestEnvironment = testEnvironment
                testEnvironment = (hooks) => {
                    Object.keys(MODULE_HOOKS).forEach((hookName) => {
                        hooks[hookName]((assert) => {
                            return this.wrapHook(MODULE_HOOKS[hookName])(assert)
                        })
                    })
                    origTestEnvironment(hooks)
                }
            }

            // run original QUnit.module with wrapped hooks
            qunitModule(name, testEnvironment, executeNow)
        }
    }

    async execStartHook () {
        executeHooksWithArgs(this.adapter.config.before, [this.adapter.capabilities, this.adapter.specs])
    }

    async execEndHook (result) {
        executeHooksWithArgs(this.adapter.config.after, [result, this.adapter.capabilities, this.adapter.specs])
    }

    /**
     * Hooks which are added as true QUnit hooks need to call done() to notify async
     */
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
