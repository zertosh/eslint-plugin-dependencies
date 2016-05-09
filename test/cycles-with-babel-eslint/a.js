// a => b => c => a
// a ======> c => a
function f(): void {
  require('./b');
  require('./c');
}
