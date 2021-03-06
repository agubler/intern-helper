import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import * as Suite from 'intern/lib/Suite';
import * as Command from 'leadfoot/Command';
import { Require } from '@dojo/interfaces/loader';
import ClientErrorCollector from '../../src/ClientErrorCollector';

declare const require: Require;

registerSuite({
	name: 'ClientErrorCollector',

	'client errors are returned'(this: Suite) {
		const collector = new ClientErrorCollector(this.remote);

		return this.remote
			.get(require.toUrl('./ClientErrorCollector.html'))
			.then(() => collector.init())
			.execute('__throw_an_error()', [])
			.then(() => collector.finish())
			.then((results) => {
				assert.isArray(results, 'Results should be an array');
				assert.strictEqual(results.length, 1, 'Should have a single element');
				const [ result ] = results;
				assert.include(result.message, 'Ooops...', 'Should contain the correct error name');
				assert.include((<any> result.source), 'tests/functional/ClientErrorCollector.html', 'Should be from the correct source');
				assert.isNumber(result.colno);
				assert.isNumber(result.lineno);
				assert.isObject(result.error);
				if (result.error) {
					assert.strictEqual(result.error.message, 'Ooops...');
					assert.strictEqual(result.error.name, 'Error');
				}
			});
	},

	'all client errors are returned'(this: Suite) {
		const collector = new ClientErrorCollector(this.remote);

		return this.remote
			.get(require.toUrl('./ClientErrorCollector.html'))
			.then(() => collector.init())
			.execute('__throw_an_error()', [])
			.execute('__throw_an_error()', [])
			.then(() => collector.finish())
			.then((results) => {
				assert.isArray(results, 'Results should be an array');
				assert.strictEqual(results.length, 2, 'Should have a single element');
			});
	},

	'no client errors are returned'(this: Suite) {
		const collector = new ClientErrorCollector(this.remote);

		return this.remote
			.get(require.toUrl('./ClientErrorCollector.html'))
			.then(() => collector.init())
			.then(() => collector.finish())
			.then((results) => {
				assert.isArray(results, 'Results should be an array');
				assert.strictEqual(results.length, 0, 'Should have no elements');
			});
	},

	'assertNoErrors': {
		'no errors'(this: Suite) {
			const collector = new ClientErrorCollector(this.remote);

			return this.remote
				.get(require.toUrl('./ClientErrorCollector.html'))
				.then(() => collector.init())
				.then(() => collector.assertNoErrors());
		},

		'throws on error'(this: Suite) {
			const collector = new ClientErrorCollector(this.remote);

			return this.remote
				.get(require.toUrl('./ClientErrorCollector.html'))
				.then(() => collector.init())
				.execute('__throw_an_error()', [])
				.then<Command<undefined>>(() => {
					return collector.assertNoErrors()
						.catch((e: Error) => {
							assert.instanceOf(e, Error);
							assert.include(e.message, 'Ooops...');
							assert.strictEqual(e.name, 'Error');
						});
				});
		}
	}
});
