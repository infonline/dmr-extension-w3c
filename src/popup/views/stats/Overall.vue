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
          <template v-if="overallUsage.series[0].data.length > 0">
            <v-card-text class="pa-0">
              <v-chart
                type="bar"
                height="185"
                :options="overallUsage.options"
                :series="overallUsage.series"
              />
            </v-card-text>
          </template>
          <template v-else>
            <v-container
              fluid
              style="height: 200px"
            >
              <v-layout
                align-center
                justify-center
                column
                fill-height
              >
                <v-avatar>
                  <v-icon
                    size="64"
                    class="mdi mdi-cancel grey--text"
                  />
                </v-avatar>
                <span class="subtitle-2 mt-3 text-xs-center grey--text">
                  {{ $t('noData') }}
                </span>
              </v-layout>
            </v-container>
          </template>
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
