function f(a = require('a')) {
  x = {...require('b')}
  class x extends require('c') {}
  () => {
    require('d', require('e', require('f')))
  }
  ({
    [require('g')]: async (require('h')),
  })
  (function *() {
    yield require('i');
  })
}
