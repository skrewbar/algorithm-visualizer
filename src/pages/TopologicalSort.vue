<template>
  <div class="row" style="height: 80vh">
    <div class="col"><CodeEditor @get-text="makeGraph" /></div>
    <div class="col">
      <v-network-graph :zoom-level="1.5" :nodes="nodes" :edges="edges" :configs="configs">
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
import type { Nodes, Edges } from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'

import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import Queue from 'src/helpers/Queue'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const nodes: Nodes = reactive({
  // node1: { name: 'Node 1' },
  // node2: { name: 'Node 2' },
})
const edges: Edges = reactive({
  // edge1: { source: 'node1', target: 'node2' },
})
const indegree: number[] = reactive([])

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
            .force('edge', forceLink.distance(40).strength(0.5))
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

  console.log(code)
  console.log(nodes)
  console.log(edges)
  console.log(indegree)
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

  const queue = new Queue<number>()
  Object.keys(nodes).forEach((key: string) => {
    const node = Number(key) - 1
    if (indegree[node] === 0) queue.push(node)
  })

  while (!queue.empty()) {
    const now = queue.pop()
    adj[now]!.forEach((nextNode: number) => {
      indegree[nextNode]!--
      if (indegree[nextNode] === 0) queue.push(nextNode)
    })
  }
}
</script>
