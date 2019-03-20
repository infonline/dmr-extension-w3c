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
          height="490"
        >
          <v-layout
            align-center
            class="ma-0 py-3"
          >
            <v-icon
              light
              class="pl-3"
            >assignment_turned_in</v-icon>
            <span class="subheading pl-3">Registration</span>
          </v-layout>
          <v-divider></v-divider>
          <v-responsive height="381">
            <v-list two-line>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>account_circle</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>INFOnline User ID</v-list-tile-title>
                  <v-list-tile-sub-title>{{registration.userId}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>monetization_on</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{registration.vendor
                    ? registration.vendor.charAt(0).toUpperCase() + registration.vendor.slice(1)
                    : 'n. a.'}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>{{registration.panelId || 'n. a.'}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>event</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Created</v-list-tile-title>
                  <v-list-tile-sub-title>{{registration.createdAt}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>event</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Updated</v-list-tile-title>
                  <v-list-tile-sub-title>{{registration.updatedAt}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-responsive>
          <v-card-actions>
            <v-btn
              flat
              color="primary"
              to="/"
            >Back</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              dark
              @click="deregister()"
            >Remove</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script src="./Registration.js"></script>
