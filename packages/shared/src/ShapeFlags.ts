export const enum ShapeFlags { // vue3提供的形状标识
    ELEMENT = 1, // 1
    FUNCTIONAL_COMPONENT = 1 << 1, // 2
    STATEFUL_COMPONENT = 1 << 2, // 4
    TEXT_CHILDREN = 1 << 3, // 8
    ARRAY_CHILDREN = 1 << 4, // 16
    SLOTS_CHILDREN = 1 << 5, // 32
    TELEPORT = 1 << 6, // 64
    SUSPENSE = 1 << 7, // 128
    COMPONENT_SHOULE_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
  }