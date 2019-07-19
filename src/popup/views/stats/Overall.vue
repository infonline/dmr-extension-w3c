<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container
    class="pa-2"
    fluid
    grid-list-md
  >
    <v-layout
      fluid
      row
      wrap
    >
      <v-flex xs12>
        <v-card
          class="elevation-2"
        >
          <v-chart-control
            :value="timeRange"
            :items="timeRanges"
            :label="$t('timeRanges.label')"
            @change="(range) => toggleRange(range)"
            @reload="() => reload('overallUsage')"
          />
          <v-card-text class="pa-0">
            <v-chart
              type="bar"
              height="175"
              :options="overallUsage.options"
              :series="overallUsage.series"
            />
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card
          class="elevation-2"
        >
          <v-card-text>
            <v-chart
              type="pie"
              height="175"
              :options="top5Websites.options"
              :series="top5Websites.series"
            />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Overall.js"></script>
