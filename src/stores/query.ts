import { ref, type InjectionKey, type Ref } from "vue";

export const queryProvivderKey = Symbol() as InjectionKey<{
  foo: Ref<string>;
}>

const foo = ref("hello");

export const queryProvider = {
  foo
}