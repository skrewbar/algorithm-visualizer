class QueueNode<T> {
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
      return
    }

    const newNode = new QueueNode(value, this.tail)
    this.tail!.next = newNode // head가 undefined가 아니면 tail도 아님
    this.tail = newNode

    this.length++
  }

  pop(): T {
    const ret = this.head!.value
    this.head = this.head!.next

    this.length--
    return ret!
  }

  empty(): boolean {
    return this.length === 0
  }
}

const queue = new Queue<number>()
for (let i = 0; i < 10; i++) queue.push(i)
while (!queue.empty()) {
  console.log(queue.pop())
}

export default Queue
