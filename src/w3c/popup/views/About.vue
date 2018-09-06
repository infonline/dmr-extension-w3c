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
            >info
            </v-icon>
            <span class="subheading pl-3">About</span>
          </v-layout>
          <v-divider></v-divider>
          <v-responsive height="381">
            <v-list two-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Name</v-list-tile-title>
                  <v-list-tile-sub-title>IMAREX</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Description</v-list-tile-title>
                  <v-list-tile-sub-title>
                    INFOnline Market Research Extension for {{browser.name}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Version</v-list-tile-title>
                  <v-list-tile-sub-title>{{version}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <v-list>
              <v-list-tile
                ripple
                to="/licenses"
              >
                <v-list-tile-avatar>
                  <v-icon>assignment</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Licences</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon>arrow_forward</v-icon>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                ripple
                @click="() => createTab(links.privacy)"
              >
                <v-list-tile-avatar>
                  <v-icon>security</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Privacy</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon>arrow_forward</v-icon>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                ripple
                @click="() => createTab(links.bugs)"
              >
                <v-list-tile-avatar>
                  <v-icon>bug_report</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Report a bug</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon>arrow_forward</v-icon>
                </v-list-tile-action>
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
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./About.js"></script>
