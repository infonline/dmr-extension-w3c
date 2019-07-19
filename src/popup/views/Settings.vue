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
              class="pl-3 mdi mdi-settings"
            />
            <span class="subtitle-1 pl-3">
              {{ $t('headline') }}
            </span>
          </v-layout>
          <v-divider />
          <v-responsive height="381">
            <v-list two-line>
              <v-list-item>
                <v-list-item-avatar>
                  <v-icon
                    v-if="settings.tracking"
                    class="mdi mdi-eye"
                  />
                  <v-icon
                    v-else
                    class="mdi mdi-eye-off"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('listItems.tracking.label') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $tc('listItems.tracking.text', settings.tracking ? 1 : 2) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch
                    v-model="settings.tracking"
                    :disabled="!registration.panelId && !registration.vendor"
                    color="accent"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-responsive>
          <v-spacer />
          <v-card-actions>
            <v-btn
              text
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
