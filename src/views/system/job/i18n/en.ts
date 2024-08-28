export default {
  job: {
    fields: {
      jobName: 'job name',
      jobGroupName: 'job group name',
      cronExpression: 'cron expression',
      clazzName: 'clazz name',
      misfirePolicy: 'misfire policy',
      concurrent: 'concurrent',
      status: 'status',
    },
    common: {
      jobRunSuccess: 'job tun successfully',
      jobRunImmediately: 'job run immediately',
    },
    rules: {
      cronExpression: 'Please set the cron expression',
      clazzName: 'Please enter the execution className.MethodName(parameter)',
    },
  },
  jLog: {
    fields: {
      jobName: 'job name',
      jobGroupName: 'job group name',
      cronExpression: 'cron expression',
      clazzName: 'clazz name',
      jobMessage: 'job message',
      exceptionInfo: 'exception info',
      jobStatus: 'job status',
      endTime: 'end time',
    },
    common: {
      jLogViewing: 'job log viewing',
    },
  },
}
