<template>
  <v-container fill-height fluid grid-list-xl>
    <v-layout
      justify-center
      wrap
    >
      <v-flex xs12 md12>
        <material-card
          color="green"
          title="Agregar Empresa"
          text="complete todo los campos"
        >
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <div class="d-flex">
              <v-flex xs12 md4>
                <v-text-field
                  v-model="name"
                  :counter="20"
                  :rules="nameRules"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field
                  v-model="code"
                  :rules="codeRules"
                  label="Code"
                  type="number"
                  required
                ></v-text-field>
              </v-flex>
            </div>
            
            <v-flex xs12 md12>
              <v-btn
                :disabled="!valid"
                color="success"
                @click="save"
              >
                Agregar
              </v-btn>
            </v-flex>
          </v-form>
        </material-card>
      </v-flex>
       <!-- DATA TABLE - START -->
      <v-flex xs12>
      <v-toolbar flat color="white">
        <v-toolbar-title>Mi CRUD</v-toolbar-title>
        <v-divider
          class="mx-2"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Editar Producto</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.name" label="Nombre"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.code" label="Codigo"></v-text-field>
                  </v-flex>
                   <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.date" label="Fecha" disabled></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" flat @click="saveEdit">Guargar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="companies"
        class="elevation-1"
      >
        <template slot="items" slot-scope="{ item }">
          <td class="text-xs-left">{{item._id.substr(0,4) }}</td>
          <td class="text-xs-center">{{ item.name }}</td>
          <td class="text-xs-center">{{ item.code }}</td>
          <td class="justify-center layout px-0 m-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="modalDelete(item)"
            >
              mdi-delete
            </v-icon>
          </td>
        </template>
      </v-data-table>
      </v-flex>
    </v-layout>
    <!-- Model delete -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Eliminar la empresa</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <p>Esta seguro que quiere eliminar la empresar <b>{{this.editedItem.name}}</b></p>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="deleteItem()">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name:'Empresa',
  data() {
    return {
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Nombre es requerido',
        v => (v && v.length <= 20) || 'Nombre tiene que ser menos de 10 caracteres'
      ],
      code: '',
      codeRules: [
        v => !!v || 'Codigo es requerdio'
      ],
      // data table
      dialog: false,
      dialogDelete:false,
      headers: [
        {
          text: 'id',
          align: 'left',
          sortable: false,
          value: '_id'
        },
        { text: 'Nombre',  align: 'center',value: 'name' },
        { text: 'codigo', align: 'center',value: 'code' },
        { text: 'Acción', align: 'center',value: 'name', sortable: false }
      ],
      companies: [],
      editedItem: {
        name: '',
        code: '',
      },
      defaultItem: {
        name: '',
        code: '',
      }
    }
  },
 created () {
   this.obtenerDatos()
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  methods:{
    async obtenerDatos(){
        await this.axios.get(`${this.$store.state.baseURL}/api/company`)
          .then(res => {
            const resultado = res.data           
            this.companies = resultado
          })
    },
    async save () {
      //  const formData = new FormData()
      //   formData.append('name',this.name)
      //   formData.append('code',this.code)
      const data = {
        name:this.name,
        code:this.code
      }
        await this.axios.post(`${this.$store.state.baseURL}/api/company`,data,{
          headers:{
            'Content-Type':'application/json'
          }
        })
              .then(res => {
                this.obtenerDatos()
                console.log('company', res.data);
                this.name = '',
                this.code = ''
              }).catch(error => {
                console.log(error);
                this.name = '',
                this.code = ''
              });
    },
    editItem (item) {
      this.editedIndex = this.companies.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    modalDelete(item){
      this.editedIndex = this.companies.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    deleteItem (item) {
      this.axios.delete(`${this.$store.state.baseURL}/api/company/`+ this.editedItem._id)
        .then( res => {
          this.obtenerDatos()
          this.dialogDelete = false
        })
    },
    close () {
      this.dialog = false
      this.dialogDelete = false
    },
    async saveEdit () {
      let company = {
        name:this.editedItem.name,
        code:this.editedItem.code
      }
      
      await this.axios.put(`${this.$store.state.baseURL}/api/company/`+ this.editedItem._id, company)
        .then(res => {
          this.obtenerDatos()
          this.close()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container.grid-list-xl .layout:not(:only-child){
  margin: auto 0;
}
</style>