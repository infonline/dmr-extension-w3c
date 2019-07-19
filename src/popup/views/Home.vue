<template>
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
      <v-flex
        xs12
      >
        <v-card
          height="250"
          :color="getColor()"
        >
          <v-card-title>
            <v-icon
              dark
              class="mdi mdi-account-badge"
            />
            <span class="subtitle-1 white--text pl-2">
              {{ $t('status.headline') }}
            </span>
          </v-card-title>
          <v-card-text class="io-status-card-text pa-0">
            <v-layout
              class="ma-0"
              align-center
              justify-center
              fill-height
            >
              <v-avatar
                size="96"
              >
                <v-icon
                  dark
                  size="96"
                  class="mdi"
                  :class="getIcon()"
                />
              </v-avatar>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="isConfirmed && isActivated"
              dark
              text
              to="/registration"
            >
              {{ $t('status.buttons.details') }}
            </v-btn>
            <v-btn
              v-if="!isConfirmed"
              dark
              text
              @click="() => register()"
            >
              {{ $t('status.buttons.register') }}
            </v-btn>
            <v-btn
              v-if="isConfirmed && !isActivated"
              dark
              text
              to="/settings"
            >
              {{ $t('status.buttons.activate') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex
        xs6
      >
        <v-card
          height="230"
          color="primary"
        >
          <v-card-title>
            <v-icon
              dark
              class="mdi mdi-application"
            />
            <span class="subtitle-1 white--text pl-2">
              {{ $t('site.headline') }}
            </span>
          </v-card-title>
          <v-card-text
            class="io-stats-card-text display-3 white--text text-xs-center pa-0"
          >
            <v-layout
              class="ma-0"
              align-center
              justify-center
              fill-height
            >
              {{ siteCount }}
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              dark
              text
              to="/stats/site"
            >
              {{ $t('site.button') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex
        xs6
      >
        <v-card
          height="230"
          color="accent"
        >
          <v-card-title>
            <v-icon
              dark
              class="mdi mdi-chart-timeline-variant"
            />
            <span class="subtitle-1 white--text pl-2">
              {{ $t('overall.headline') }}
            </span>
          </v-card-title>
          <v-card-text
            class="io-stats-card-text display-3 white--text text-xs-center pa-0"
          >
            <v-layout
              class="ma-0"
              align-center
              justify-center
              fill-height
            >
              {{ overallCount }}
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              dark
              text
              to="/stats/overall"
            >
              {{ $t('overall.button') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Home.js"></script>
<style type="text/scss" lang="scss" scoped>
  .io-status-card-text {
    height: 150px;
  }
  .io-stats-card-text {
    height: 131px;
  }
</style>
