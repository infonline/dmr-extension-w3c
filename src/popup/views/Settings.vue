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
              settings
            </v-icon>
            <span class="subheading pl-3">
              {{ $t('headline') }}
            </span>
          </v-layout>
          <v-divider />
          <v-responsive height="381">
            <v-list two-line>
              <v-list-tile>
                <v-list-tile-avatar>
                  <v-icon>visibility</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ $t('listItems.tracking.label') }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ $tc('listItems.tracking.text', settings.tracking ? 1 : 2) }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-switch
                    v-model="settings.tracking"
                    :disabled="!registration.panelId && !registration.vendor"
                    color="accent"
                  />
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-responsive>
          <v-spacer />
          <v-card-actions>
            <v-btn
              flat
              color="primary"
              to="/"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="secondary"
              class="primary--text"
              @click="handleClick(settings)"
            >
              {{ $t('buttons.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script type="text/javascript" src="./Settings.js"></script>
