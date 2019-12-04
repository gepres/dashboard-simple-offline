<template>
  <v-content>
    <div id="core-view">
      <v-alert
      :value="true"
      type="warning"
      v-if="modeNavigator"
      class="mode-fixed"
    >
     Estas en modo <b>OFFLINE</b>
    </v-alert>
    <v-alert
      :value="true"
      type="success"
      v-if="modeOnline"
      class="mode-fixed"
    >
      Estas en modo <b>ONLINE</b>
    </v-alert>
      <v-fade-transition mode="out-in">
        <router-view />
      </v-fade-transition>
    </div>
    <core-footer v-if="$route.name !== 'Maps'" />
  </v-content>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: 'Vuetify Dashboard by gepresDesgin'
    }
  },
  created(){
    window.addEventListener('online', this.isOnline)
    window.addEventListener('offline', this.isOnline)
     this.isOnline();
  },
  data(){
    return {
      modeNavigator: false,
      modeOnline : false
    }
  },
  methods:{
    isOnline(){
      if(navigator.onLine){
        // tenemos conexion
        console.log('online'); 
        this.modeNavigator =  false
        this.modeOnline = true
        setTimeout(() => {
          this.modeOnline = false
        }, 2000);
      }else{
          // no tenemos conexion
          console.log('offline');
          this.modeNavigator =  true
          window.addEventListener('online', this.modeReload)
      }
    },
    modeReload(){
     setTimeout(() => {
        window.location.reload()
     }, 1500);
    }
  }
}
</script>

<style>
#core-view {
  padding-bottom: 100px;
}
.mode-fixed{
  position:fixed !important;
  z-index:100;
  width: 100%;
}
</style>
