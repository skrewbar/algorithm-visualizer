import Queue, { EmtpyQueueError } from '../src/helpers/Queue'

const randomArray = (length: number) => Array(length).fill(null).map(Math.random)

describe('Queue class', () => {
  it('should push items correctly', () => {
    const queue = new Queue<number>()
    const nums = randomArray(10)
    nums.forEach((value) => queue.push(value))

    expect(queue.length).toStrictEqual(nums.length)

    let now = queue.head
    let index = 0
    while (index < nums.length) {
      expect(now).not.toBeUndefined()
      expect(now!.value).toStrictEqual(nums[index])
      now = now!.next
      index++
    }
  })

  it('should make queue from array correctly', () => {
    const nums = randomArray(10)
    const arrayQueue = Queue.fromArray(nums)
    const pushQueue = new Queue<number>()
    nums.forEach((value) => pushQueue.push(value))

    expect(arrayQueue).toStrictEqual(pushQueue)
  })

  it('should pop items correctly', () => {
    const queue = new Queue<number>()
    const nums = randomArray(10)
    nums.forEach((value) => queue.push(value))

    let index = 0
    while (index < nums.length) {
      expect(queue.pop()).toStrictEqual(nums[index])
      index++
    }
  })

  it('should throw EmptyQueueError when trying to pop from empty queue', () => {
    const queue = new Queue()
    expect(() => queue.pop()).toThrow(EmtpyQueueError)
  })

  it('should check correctly whether the queue is empty', () => {
    const queue = new Queue<number>()
    expect(queue.empty()).toBe(true)
    queue.push(1)
    expect(queue.empty()).toBe(false)
    queue.pop()
    expect(queue.empty()).toBe(true)
  })

  it('should clear correctly', () => {
    const queue = Queue.fromArray(randomArray(10))
    queue.clear()
    expect(queue.empty()).toBe(true)
  })

  it('should copy correctly', () => {
    const queue = Queue.fromArray(randomArray(10)),
      other = new Queue<number>()

    other.copy(queue)
    expect(other).toStrictEqual(queue)
  })

  it('should run callback function for each element correctly', () => {
    const nums = randomArray(10)
    const queue = Queue.fromArray(nums)

    let i = 0
    queue.forEach((val) => expect(val).toStrictEqual(nums[i++]))
    i = 0
    queue.forEachWithIndex((val, index) => {
      expect(val).toStrictEqual(nums[i])
      expect(index).toBe(i++)
    })
  })
})
