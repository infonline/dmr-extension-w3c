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
          height="490"
        >
          <v-layout
            align-center
            class="ma-0 py-3"
          >
            <v-icon
              light
              class="pl-3"
            >
              assignment_turned_in
            </v-icon>
            <span class="subheading pl-3">
              Registration
            </span>
          </v-layout>
          <v-divider />
          <v-responsive height="381">
            <v-list two-line>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>account_circle</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ $t('listItems.userId') }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ registration.userId }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>
                    monetization_on
                  </v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ $t('listItems.provider') }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ registration.provider ? registration.provider.label : $t('unknown') }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>event</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ $t('listItems.createdAt') }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ registration.createdAt }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>event</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ $t('listItems.updatedAt') }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    { registration.updatedAt }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-responsive>
          <v-card-actions>
            <v-btn
              flat
              color="primary"
              to="/"
            >
              {{ $t('buttons.back') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="error"
              dark
              @click="deregister()"
            >
              {{ $t('buttons.revoke') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script src="./Registration.js"></script>
