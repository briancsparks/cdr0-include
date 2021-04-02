# include

Like require, but gets from sibling directory if present.

The easy way to work on multiple repos.

## One Fish

Develop all your modules in the same directory:

- project-root
  - project-1
  - project-2
  - project-3

## Two Fish

```shell
npm i -S @cdr0/include
```

```javascript
// At the top
const include = requre('@cdr0/include')(module);

// ...

const redFish    = include('red-fish')  || require('red-fish');
const blueFish   = include('blue-fish') || require('blue-fish');
```
