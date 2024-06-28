// store a global YASQE instance pointer

import type Yasqe from "@triply/yasqe";

const yasqeGlobal: {
  yasqeInstance: Yasqe | null
} = {
  yasqeInstance:  null,
}

export default yasqeGlobal;
  