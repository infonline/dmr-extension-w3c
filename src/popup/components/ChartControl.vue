<template>
  <v-layout
    column
    class="pa-0 ma-0"
  >
    <v-divider />
    <v-toolbar
      class="io-chart-control-toolbar"
      color="white"
      dense
      flat
    >
      <v-btn
        icon
        @click="previous()"
      >
        <v-icon class="grey--text text--darken-2 mdi mdi-chevron-left" />
      </v-btn>
      <v-divider
        vertical
      />
      <v-overflow-btn
        :value="value"
        :items="items"
        :label="label"
        segmented
        hide-details
        class="pa-0"
        overflow
        @change="(item) => toggle(item)"
      />
      <v-divider
        vertical
      />
      <v-btn
        icon
        @click="next()"
      >
        <v-icon class="grey--text text--darken-2 mdi mdi-chevron-right" />
      </v-btn>
      <v-divider
        vertical
      />
      <v-btn
        icon
        @click="reload()"
      >
        <v-icon class="grey--text text--darken-2 mdi mdi-reload" />
      </v-btn>
    </v-toolbar>
    <v-divider class="mb-2" />
  </v-layout>
</template>
<script type="text/javascript" src="./ChartControl.js"></script>
