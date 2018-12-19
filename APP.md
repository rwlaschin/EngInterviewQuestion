# PrioritySchedule

Interface to pull data from 3rd party providers

## Installation

`npm install @rwlaschin/EngInterviewQuestion`

## Usage

    The example below shows how to load and initialize the priority scheduler.

    npm start

Output to standard out update information

## Running

For testing and examples there is a web server that runs on part 8080

`npm start`

## Tests

`npm test`

## Routes

Routes are defined in _/src/Paths_

**/start** - starts sync process

**/stop** - stop sync process

**/appointments**?&start=[YYYY-MM-DD]&(provider|facility)=[String]

- displays 'limited' weekly schedule, refreshes every few seconds
- param {YYYY-MM-DD} start - display schedule starting at date
- param {String} provider - filter appointments by provider name
- param {String} facility - filter appointments by facility name

/dump - JSON output of in memory data

## Logging Dump

Application writes data changes to standard out

- facility [name]
- provider [name]
- appointment [date](+|-|m) [[key value], ...]
- patient [name](+|-|m) [[key value],...]

Modifiers

- \+ field was added
- \- field was removed
- m field was modified

## Environment variables

    Environment variables are defined in .env

    PORT [8080] - Defines port for application to listen
    START [true] - Tells the application to start syncing at load
    UPDATE_PERIOD_SECONDS [10] - Seconds between syncs
    DEFAULT_EXPIRE_SECONDs [31557600] - For memory store, how long to persist keys

    MEMORYSTORE [redis] - Enable the redis memory store, blank will use in memory
    REDIS_HOST [localhost] - Host redis is listening on
    REDIS_PORT [6379] - Port redis is listening on
    REDIS_PASSWORD [] - Password

## Redis Management

    App is confiugred to work with Redsmin, this allows detailed inspection of redis, no endpoint is available
    for inspecting redis

    https://app.redsmin.com

## Dependancies

    This application requres redis if option is enabled

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
