export class EmtpyQueueError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmptyQueueError'
  }
}

export class QueueNode<T> {
  value?: T | undefined
  prev?: QueueNode<T> | undefined
  next?: QueueNode<T> | undefined

  constructor(value?: T, prev?: QueueNode<T>, next?: QueueNode<T>) {
    this.value = value
    this.prev = prev
    this.next = next
  }
}

class Queue<T> {
  head?: QueueNode<T> | undefined
  tail?: QueueNode<T> | undefined
  length: number = 0

  push(value: T): void {
    if (this.head === undefined) {
      this.head = new QueueNode(value)
      this.tail = this.head
      this.length++
      return
    }

    const newNode = new QueueNode(value, this.tail)
    this.tail!.next = newNode // head가 undefined가 아니면 tail도 아님
    this.tail = newNode

    this.length++
  }

  pop(): T {
    if (this.empty()) throw new EmtpyQueueError('tries to pop from empty queue')

    const ret = this.head!.value
    this.head = this.head!.next

    this.length--
    return ret!
  }

  empty(): boolean {
    return this.length === 0
  }

  clear(): void {
    this.head = undefined
    this.tail = undefined
    this.length = 0
  }

  copy(other: Queue<T>) {
    this.clear()
    other.forEach((val) => this.push(val))
  }

  forEach(callback: (val: T) => void) {
    let pointer = this.head
    if (pointer === undefined) return
    while (pointer !== undefined) {
      callback(pointer.value!)
      pointer = pointer.next
    }
  }

  forEachWithIndex(callback: (val: T, index: number) => void) {
    let pointer = this.head
    let index = 0
    if (pointer === undefined) return
    while (pointer !== undefined) {
      callback(pointer.value!, index++)
      pointer = pointer.next
    }
  }
}

export default Queue
