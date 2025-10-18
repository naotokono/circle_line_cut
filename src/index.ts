import { foo } from "./foo.ts";
import { bar } from "./bar.ts";

// HMR ではなく普通のリロードにする
(import.meta as any).hot?.accept(() => location.reload());

console.log(`${foo()} ${bar()}`);
