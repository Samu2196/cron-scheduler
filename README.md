# Cron Schedule Editor

Imagine there’s a service that runs a specific task on a CRON schedule. While the service works fine, CRON expressions are hard to use because they require knowledge of a complex and uncommon syntax. Although CRON allows for highly flexible schedules, most users only need a few basic options.

Your task is to create a simple, user-friendly UI that makes editing schedules easy. This UI should hide the complexity of CRON expressions under the hood, so users don’t need to worry about it.

The UI must allow saving its configuration as a CRON expression and load it back from one. However, users don’t need to know that CRON is used behind the scenes.

The UI should support these common scheduling types:

Run every X minutes.

Run at specific times on selected days of the week (e.g., at 14:30).

Run at one or two specific times every day.

Run on specific days of the month (details can be planned).


## install

```sh
$ npm i
```

## run

```sh
$ npm start
```
>>>>>>> a78b788 (create cron schedule editor)
