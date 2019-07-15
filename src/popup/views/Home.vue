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
            >
              assignment_turned_in
            </v-icon>
            <span class="subheading white--text pl-2">
              {{ $t('status.headline') }}
            </span>
          </v-card-title>
          <v-card-text
            class="text-xs-center"
            style="height: 142px;"
          >
            <v-avatar
              size="96"
            >
              <v-icon
                dark
                size="96"
              >
                {{ getIcon() }}
              </v-icon>
            </v-avatar>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="isConfirmed && isActivated"
              dark
              flat
              to="/registration"
            >
              {{ $t('status.buttons.details') }}
            </v-btn>
            <v-btn
              v-if="!isConfirmed"
              dark
              flat
              @click="() => register()"
            >
              {{ $t('status.buttons.register') }}
            </v-btn>
            <v-btn
              v-if="isConfirmed && !isActivated"
              dark
              flat
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
            >
              pageview
            </v-icon>
            <span class="subheading white--text pl-2">
              {{ $t('site.headline') }}
            </span>
          </v-card-title>
          <v-card-text
            class="display-3 white--text text-xs-center"
            style="height: 122px;"
          >
            {{ siteCount }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              dark
              flat
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
            >
              timeline
            </v-icon>
            <span class="subheading white--text pl-2">
              {{ $t('overall.headline') }}
            </span>
          </v-card-title>
          <v-card-text
            class="display-3 white--text text-xs-center"
            style="height: 122px;"
          >
            {{ overallCount }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              dark
              flat
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
