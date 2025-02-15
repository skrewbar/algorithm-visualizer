<template>
  <div class="row" style="height: 100vh">
    <div class="col"><CodeEditor v-model="inputText" /></div>
    <div class="col">
      <v-network-graph :zoom-level="0.5" :nodes="nodes" :edges="edges" :configs="configs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import CodeEditor from 'src/components/CodeEditor.vue'
import { reactive, ref, watch } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'

const inputText = ref(`\
// node count
// from to cost
// example below
// 3
// 1 2 3
// 2 3 5
// 3 1 7`)

const nodes: vNG.Nodes = reactive({})
const edges: vNG.Edges = reactive({})

watch(inputText, () => {
  const inputLines: string[] = inputText.value.split('\n')
  const nodeCount = Number(inputLines[0])

  Object.keys(nodes).forEach((id) => delete nodes[id])
  Object.keys(edges).forEach((id) => delete edges[id])
  for (let i = 1; i <= nodeCount; i++) {
    Object.defineProperty(nodes, `node${i}`, {})
  }
  for (let i = 1; i < inputLines.length; i++) {
    const [a, b] = inputLines[i]!.split(' ')!
    Object.defineProperty(edges, `edge${a}-${b}`, {
      value: { source: `node${a}`, target: `node${b}` },
    })
  }

  console.log(inputLines)
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
        visible: false,
      },
    },
  }),
)
</script>
