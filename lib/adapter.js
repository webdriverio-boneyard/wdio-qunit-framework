import path from 'path'
import QUnit from 'qunitjs'

import QUnitReporter from './reporter'
import QUnitHooker from './hooker'

/**
 * QUnit runner
 */
class QUnitAdapter {
    constructor (cid, config, specs, capabilities) {
        this.cid = cid
        this.capabilities = capabilities
        this.specs = specs
        this.config = Object.assign({
            qunitOpts: {}
        }, config)

        this.runner = global.QUnit = QUnit

        this.hooker = new QUnitHooker(this)
        this.reporter = new QUnitReporter(this)
    }

    async run () {
        // setup QUnit
        Object.keys(this.config.qunitOpts).forEach((key) => {
            this.runner.config[key] = this.config.qunitOpts[key]
        })
        this.runner.config.autostart = false

        // setup hooks & reporter
        this.hooker.setupHooks()
        this.reporter.setupEventListeners()

        await this.hooker.execStartHook()
        let result = await new Promise((resolve, reject) => {
            // load QUnit tests
            this.requireExternalModules(this.specs)
            // start & end QUnit
            this.runner.done((details) => resolve(details.failed))
            this.runner.start()
        })
        await this.hooker.execEndHook(result)
        await this.reporter.waitUntilSettled()

        return result
    }

    requireExternalModules (modules, context) {
        modules.forEach(module => {
            if (module) {
                module = module.replace(/.*:/, '')

                if (module.substr(0, 1) === '.') {
                    module = path.join(process.cwd(), module)
                }

                this.load(module, context)
            }
        })
    }

    load (name, context) {
        try {
            module.context = context || module.context

            require(name)
        } catch (e) {
            throw new Error(`Module ${name} can't get loaded. Are you sure you have installed it?\n` +
                            `Note: if you've installed WebdriverIO globally you need to install ` +
                            `these external modules globally too!`)
        }
    }
}

const _QUnitAdapter = QUnitAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _QUnitAdapter(cid, config, specs, capabilities)
    return await adapter.run()
}

export default adapterFactory
export { QUnitAdapter, adapterFactory }
