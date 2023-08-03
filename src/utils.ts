export function asyncTimeout(delay: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}
