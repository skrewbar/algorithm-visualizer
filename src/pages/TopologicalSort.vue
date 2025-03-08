<template>
  <div class="row" style="height: 80vh">
    <div class="col"><CodeEditor @get-text="makeGraph" /></div>
    <div class="col">
      <v-network-graph
        :zoom-level="1.5"
        :nodes="nodes"
        :edges="edges"
        :configs="configs"
        :layouts="layouts"
      >
        <template
          #override-node-label="{ nodeId, scale, text, x, y, config, textAnchor, dominantBaseline }"
        >
          <text
            x="0"
            y="0"
            :font-size="config.fontSize * scale"
            :text-anchor="textAnchor"
            :dominant-baseline="dominantBaseline"
            :fill="config.color"
            :transform="`translate(${x} ${y})`"
            >{{ text }}
          </text>
          <text
            x="0"
            y="15"
            :font-size="9 * scale"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#000"
            >{{ indegree[Number(nodeId) - 1] }}
          </text>
        </template>
      </v-network-graph>
      <q-btn @click="topologicalSort" push color="white" text-color="primary" label="Run" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeEditor from 'src/components/CodeEditor.vue'

import { reactive } from 'vue'

import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'
import * as vNG from 'v-network-graph'
import type { Nodes, Edges, Layouts } from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'

import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import Queue from 'src/helpers/Queue'

const nodeGap = 50

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const nodes: Nodes = reactive({
  // node1: { name: 'Node 1' },
  // node2: { name: 'Node 2' },
})
const edges: Edges = reactive({
  // edge1: { source: 'node1', target: 'node2' },
})
const indegree: number[] = reactive([])
const layouts: Layouts = reactive({ nodes: {} })

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: true,
        createSimulation: (d3, nodes, edges) => {
          // d3-force parameters
          const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d) => d.id)
          return d3
            .forceSimulation(nodes)
            .force('edge', forceLink.distance(20).strength(1))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter().strength(0.05))
            .alphaMin(0.001)
        },
      }),
    },
    node: {
      label: { direction: 'center', color: '#fff' },
    },
    edge: {
      marker: {
        target: {
          type: 'arrow',
        },
      },
    },
  }),
)

function makeGraph(code: string) {
  const inputLines: string[] = code.split('\n')
  const nodeCount = Number(inputLines[0])

  // nodes 재정의
  const idNums = [...Array(nodeCount)].map((_, i) => i + 1)
  const newNodes = Object.fromEntries(idNums.map((id) => [`${id}`, { name: `${id}` }]))
  Object.keys(nodes).forEach((id) => delete nodes[id])
  Object.assign(nodes, newNodes)

  idNums.map((id) => (layouts.nodes[`${id}`] = { x: 0, y: 0, fixed: false }))

  // edges, indegree 재정의
  const makeEdgeEntry = (id1: number, id2: number) => {
    return [`${id1}-${id2}`, { source: `${id1}`, target: `${id2}` }]
  }
  const edgeEntries = []
  const newIndegree = Array(nodeCount).fill(0)
  for (let i = 1; i < inputLines.length; i++) {
    const [a, b] = inputLines[i]!.split(' ')!.map((v) => Number(v)) as [number, number]
    newIndegree[b - 1]!++
    edgeEntries.push(makeEdgeEntry(a, b))
  }
  const newEdges = Object.fromEntries(edgeEntries)
  Object.keys(edges).forEach((id) => delete edges[id])
  Object.assign(edges, newEdges)
  Object.assign(indegree, newIndegree)
}

/**
 * TODO
 *
 * 위상정렬 결과 페이지에 띄우기
 */
async function topologicalSort() {
  const nodeCount = Object.keys(nodes).length

  const adj: number[][] = Array.from({ length: nodeCount }).map(() => [])

  // 인접리스트 채우기
  Object.keys(edges).forEach((key: string) => {
    // NOTE: 인덱스로 쓰기 위해서 u, v에 1 빼는 것 유의
    const u = Number(edges[key]!.source) - 1
    const v = Number(edges[key]!.target) - 1
    adj[u]!.push(v)
  })

  let queue = new Queue<number>()
  let nextQueue = new Queue<number>()

  let x = -40,
    y = -nodeGap

  Object.keys(nodes).forEach((key: string) => {
    const node = Number(key) - 1
    if (indegree[node] === 0) queue.push(node)
  })

  if (queue.length === 0) y = 0
  else if (queue.length % 2 === 0) y *= (queue.length - 1) / 2
  else y *= Math.trunc(nextQueue.length / 2)
  queue.forEachWithIndex((val, index) => {
    const nodeNum = (val + 1).toString()
    layouts.nodes[nodeNum] = { x: x, y: y + index * nodeGap, fixed: true }
  })
  x += nodeGap

  do {
    while (!queue.empty()) {
      const now = queue.pop()
      adj[now]!.forEach((nextNode: number) => {
        indegree[nextNode]!--
        if (indegree[nextNode] === 0) nextQueue.push(nextNode)
      })
    }
    // nextQueue에 있는 노드들 배열
    y = -nodeGap
    if (nextQueue.length === 0) y = 0
    else if (nextQueue.length % 2 === 0) y *= (nextQueue.length - 1) / 2
    else y *= Math.trunc(nextQueue.length / 2)

    nextQueue.forEachWithIndex((val, index) => {
      const nodeNum = (val + 1).toString()
      layouts.nodes[nodeNum] = { x: x, y: y + index * nodeGap, fixed: true }
    })

    queue = nextQueue
    nextQueue = new Queue<number>()
    x += nodeGap
  } while (!queue.empty())

  console.log(layouts.nodes)
}
</script>
