<!--
 * @author: gaoweixuan
 * @since: 2023-11-12
-->
<!-- 客户端管理 -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { page, exportExcel, deleteClient } from '@/api/auth/client'
import BTable from '@/components/Table/BTable/index.vue'
import SearchContainerBox from '@/components/SearchContainerBox/index.vue'
import AddOrEdit from './components/ClientAddOrEdit.vue'
import { ElForm, ElMessage } from 'element-plus'
import type { ClientRecords } from '@/api/auth/client/type.ts'
import { ClientRecord, ClientQuery } from '@/api/auth/client/type.ts'
import { TableInfo } from '@/components/Table/types/types.ts'
import { Refresh, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'Client',
  inheritAttrs: false,
})

const { t } = useI18n()
const clientQueryFormRef = ref(ElForm)
const clientAddOrEditRef = ref()

/**
 * 查询条件
 */
const queryParams = reactive<ClientQuery>({
  clientCode: '',
  clientName: '',
  current: 1,
  size: 10,
})

let checkedRows = reactive<ClientRecords>([])
let currentRows = reactive<ClientRecords>([])

const tableInfo = reactive<TableInfo>({
  // 刷新标识
  refresh: 1,
  tableIndex: true,
  // 选择框类型
  select: 'single',
  // 表格顶部按钮
  tbHeaderBtn: [
    {
      type: 'primary',
      label: t('common.add'),
      permission: ['auth:client:create'],
      event: 'add',
      icon: 'add',
      eventHandle: () => handleAdd(),
    },
    {
      type: 'danger',
      label: t('common.delete'),
      permission: ['auth:client:delete'],
      event: 'delete',
      icon: 'delete',
      eventHandle: (rows: ClientRecords) => handleDelete(rows),
    },
    {
      type: 'default',
      label: t('common.export'),
      permission: ['auth:client:export'],
      event: 'exportCurrentPage',
      icon: 'export',
    },
    {
      type: 'default',
      label: t('common.exportAll'),
      permission: ['auth:client:export'],
      event: 'exportAll',
      icon: 'excel',
    },
  ],
  // 表格字段配置
  fieldList: [
    {
      prop: 'clientId',
      showOverflowTooltip: true,
      label: t('client.fields.clientId'),
    },
    {
      prop: 'clientName',
      showOverflowTooltip: true,
      label: t('client.fields.clientName'),
    },
    {
      prop: 'clientSecret',
      showOverflowTooltip: true,
      label: t('client.fields.clientSecret'),
    },
    {
      prop: 'clientIdIssuedAt',
      showOverflowTooltip: true,
      label: t('client.fields.clientIdIssuedAt'),
    },
    {
      prop: 'redirectUris',
      showOverflowTooltip: true,
      label: t('client.fields.redirectUris'),
    },
    {
      prop: 'scopes',
      showOverflowTooltip: true,
      label: t('client.fields.scopes'),
    },
    {
      prop: 'authorizationGrantTypes',
      showOverflowTooltip: true,
      label: t('client.fields.authorizationGrantTypes'),
    },
    {
      prop: 'clientAuthenticationMethods',
      showOverflowTooltip: true,
      label: t('client.fields.clientAuthenticationMethods'),
    },
    {
      prop: 'clientSecretExpiresAt',
      showOverflowTooltip: true,
      label: t('client.fields.clientSecretExpiresAt'),
    },
    {
      prop: 'clientSettings',
      showOverflowTooltip: true,
      label: t('client.fields.clientSettings'),
      children: [
        {
          prop: 'requireProofKey',
          showOverflowTooltip: true,
          label: t('client.fields.requireProofKey'),
        },
        {
          prop: 'requireAuthorizationConsent',
          showOverflowTooltip: true,
          label: t('client.fields.requireAuthorizationConsent'),
        },
        {
          prop: 'jwkSetUrl',
          showOverflowTooltip: true,
          label: t('client.fields.jwkSetUrl'),
        },
        {
          prop: 'tokenEndpointAuthenticationSigningAlgorithm',
          showOverflowTooltip: true,
          label: t('client.fields.tokenEndpointAuthenticationSigningAlgorithm'),
        },
      ],
    },
    {
      prop: 'tokenSettings',
      showOverflowTooltip: true,
      label: t('client.fields.tokenSettings'),
      children: [
        {
          prop: 'idTokenSignatureAlgorithm',
          showOverflowTooltip: true,
          label: t('client.fields.idTokenSignatureAlgorithm'),
        },
        {
          prop: 'accessTokenFormat',
          showOverflowTooltip: true,
          label: t('client.fields.accessTokenFormat'),
        },
        {
          prop: 'authorizationCodeTimeToLive',
          showOverflowTooltip: true,
          label: t('client.fields.authorizationCodeTimeToLive'),
        },
        {
          prop: 'accessTokenTimeToLive',
          showOverflowTooltip: true,
          label: t('client.fields.accessTokenTimeToLive'),
        },
        {
          prop: 'reuseRefreshTokens',
          showOverflowTooltip: true,
          label: t('client.fields.reuseRefreshTokens'),
        },
        {
          prop: 'refreshTokenTimeToLive',
          showOverflowTooltip: true,
          label: t('client.fields.refreshTokenTimeToLive'),
        },
      ],
    },
  ],
  handleBtn: {
    width: 210,
    label: t('common.operate'),
    fixed: 'right',
    link: true,
    btList: [
      // 编辑
      {
        label: t('common.edit'),
        type: 'success',
        icon: 'edit',
        event: 'edit',
        permission: ['auth:client:modify'],
        eventHandle: (row: ClientRecord) => handleUpdate(row),
      },
      // 查看
      {
        label: t('common.info'),
        type: 'warning',
        icon: 'view',
        event: 'view',
        permission: ['auth:client:info'],
        eventHandle: (row: ClientRecord) => handleInfo(row),
      },
      // 删除
      {
        label: t('common.delete'),
        type: 'danger',
        icon: 'delete',
        event: 'delete',
        permission: ['auth:client:delete'],
        eventHandle: (row: ClientRecord) => handleDelete([row] as ClientRecords),
      },
    ],
  },
})

/**
 * 刷新表格
 */
const reloadList = () => {
  tableInfo.refresh = Math.random()
}

/**
 * 重置查询
 */
const resetQuery = () => {
  clientQueryFormRef.value.resetFields()
  handleQuery()
}

/**
 * 查询
 */
const handleQuery = () => {
  reloadList()
}

/**
 * 添加或者修改
 *
 * @param id 主键
 */
const AddOrEditHandle = (id?: number) => {
  clientAddOrEditRef.value.init(id)
}

/**
 * 详情
 *
 * @param row 参数
 */
const handleInfo = (row: any) => {
  console.log(row)
}

/**
 * 添加
 */
const handleAdd = () => {
  AddOrEditHandle()
}

/**
 * 删除
 *
 * @param rows 行数据
 */
const handleDelete = async (rows: ClientRecords) => {
  const clientIds = rows.map((item: any) => item.id)
  await deleteClient(clientIds)
  ElMessage.success({
    message: `${t('common.delete') + t('common.success')}`,
    duration: 1000,
    onClose: () => {
      reloadList()
    },
  })
}

/**
 * 修改
 *
 * @param row 修改参数
 */
const handleUpdate = (row: any) => {
  AddOrEditHandle(row.id)
}

/**
 * 选中行，设置当前行currentRow
 *
 * @param row 选择的行数据
 */
function handleRowClick(row: ClientRecord) {
  currentRows = [row]
  console.log(currentRows)
}

/**
 * 选中行，设置当前行currentRow
 *
 * @param rows 选择的行数据
 */
const handleSelectionChange = (rows: ClientRecords) => {
  currentRows = rows
}
</script>

<template>
  <search-container-box>
    <el-form ref="clientQueryFormRef" :model="queryParams" :inline="true">
      <!-- 客户端名称 -->
      <el-form-item :label="t('client.fields.clientName')" prop="clientName">
        <el-input
          @keyup.enter="handleQuery"
          style="width: 200px"
          :placeholder="t('client.fields.clientName')"
          v-model="queryParams.clientName"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">
          {{ t('common.search') }}
        </el-button>
        <el-button type="success" :icon="Refresh" @click="resetQuery">
          {{ t('common.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </search-container-box>

  <b-table
    ref="clientTableRef"
    :export-api="exportExcel"
    :list-api="page"
    :tableIndex="tableInfo.tableIndex"
    :query="queryParams"
    :refresh="tableInfo.refresh"
    :field-list="tableInfo.fieldList"
    :tb-header-btn="tableInfo.tbHeaderBtn"
    :select="tableInfo.select"
    :checked-rows="checkedRows"
    :handle-btn="tableInfo.handleBtn"
    @selection-change="handleSelectionChange"
    @handle-row-click="handleRowClick"
  />

  <!-- 新增 / 修改 Dialog -->
  <add-or-edit ref="clientAddOrEditRef" @reload-data-list="reloadList" />
</template>
