<template>
  <div class="row" style="height: 80vh">
    <div class="col"><CodeEditor @get-text="makeGraph" /></div>
    <div class="col">
      <v-network-graph :zoom-level="1.5" :nodes="nodes" :edges="edges" :configs="configs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import CodeEditor from 'src/components/CodeEditor.vue'
import { reactive } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'

const nodes: vNG.Nodes = reactive({
  // node1: { name: 'Node 1' },
  // node2: { name: 'Node 2' },
})
const edges: vNG.Edges = reactive({
  // edge1: { source: 'node1', target: 'node2' },
})

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
      label: {
        direction: 'center',
        color: '#fff',
      },
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
  const newNodes = Object.fromEntries(idNums.map((id) => [`node${id}`, { name: `${id}` }]))
  Object.keys(nodes).forEach((id) => delete nodes[id])
  Object.assign(nodes, newNodes)

  // edges 재정의
  const makeEdgeEntry = (id1: number, id2: number) => {
    return [`edge${id1}-${id2}`, { source: `node${id1}`, target: `node${id2}` }]
  }
  const edgeEntries = []
  for (let i = 1; i < inputLines.length; i++) {
    const [a, b] = inputLines[i]!.split(' ')!
    edgeEntries.push(makeEdgeEntry(Number(a), Number(b)))
  }
  const newEdges = Object.fromEntries(edgeEntries)
  Object.keys(edges).forEach((id) => delete edges[id])
  Object.assign(edges, newEdges)

  console.log(code)
  console.log(nodes)
  console.log(edges)
}
</script>
