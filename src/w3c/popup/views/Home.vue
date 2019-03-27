<template>
  <v-container
    class="pa-2"
    fluid
    grid-list-md
  >
    <v-layout fluid row wrap>
      <v-flex
        xs12
      >
        <v-card
          height="250"
          :color="getColor()"
        >
          <v-layout
            class="ma-0"
            column
            fill-height
          >
            <v-layout
              align-center
              class="ma-0"
            >
              <v-icon dark class="pl-3">
                assignment_turned_in
              </v-icon>
              <span class="subheading white--text pl-3">
                {{ $t('status.headline') }}
              </span>
            </v-layout>
            <v-layout
              class="ma-0"
              columm
              fill-hight
              align-center
              justify-center
            >
              <v-avatar
                size="96"
              >
                <v-icon dark size="96">{{ getIcon() }}</v-icon>
              </v-avatar>
            </v-layout>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                v-if="isRegistered && isActivated"
                dark
                flat
                to="/registration"
              >{{ $t('status.buttons.details') }}</v-btn>
              <v-btn
                v-if="!isRegistered"
                dark
                flat
                @click="() => register()"
              >{{ $t('status.buttons.register') }}</v-btn>
              <v-btn
                v-if="isRegistered && !isActivated"
                dark
                flat
                to="/settings"
              >{{ $t('status.buttons.activate') }}</v-btn>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-flex>
      <v-flex
        xs6
      >
        <v-card
          height="230"
          color="primary"
        >
          <v-layout
            column
            fill-height
            class="ma-0"
          >
            <v-layout
              align-center
              class="ma-0"
            >
              <v-icon dark class="pl-3">
                pageview
              </v-icon>
              <span class="subheading white--text pl-3">
                {{ $t('site.headline') }}
              </span>
            </v-layout>
            <v-layout
              column
              align-center
              justify-center
              class="ma-0"
            >
              <div class="display-3 white--text">
                {{ siteCount }}
              </div>
            </v-layout>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                dark
                flat
              >{{ $t('site.button') }}</v-btn>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-flex>
      <v-flex
        xs6
      >
        <v-card
          height="230"
          color="accent"
        >
          <v-layout
            column
            fill-height
            class="ma-0"
          >
            <v-layout
              align-center
              class="ma-0"
            >
              <v-icon dark class="pl-3">
                timeline
              </v-icon>
              <span class="subheading white--text pl-3">
                {{ $t('overall.headline') }}
              </span>
            </v-layout>
            <v-layout
              column
              align-center
              justify-center
              class="ma-0"
            >
              <div class="display-3 white--text">
                {{ overallCount }}
              </div>
            </v-layout>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                dark
                flat
              >{{ $t('overall.button') }}</v-btn>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Home.js"></script>
