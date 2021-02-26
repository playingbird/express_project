# Cookie example

Example of using cookies in tinyhttp.

## Setup

```sh
tinyhttp new cookie
```

## Run

```sh
node index.js
```

And then in another terminal, run:

```sh
curl --cookie "user=user;password=pwd" http://localhost:3000
```
