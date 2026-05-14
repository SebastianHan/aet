"""
Gitee 同步调度器

使用 APScheduler 管理定时同步任务。
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from typing import Optional, Callable, Any, Dict
import logging

logger = logging.getLogger(__name__)


class SyncScheduler:
    """Gitee 同步调度器"""

    def __init__(self):
        self.scheduler: Optional[BackgroundScheduler] = None
        self._sync_job_id = "gitee_sync_job"

    def start(
        self,
        sync_func: Callable,
        interval_hours: int = 6,
        project_model_class=None,
        issue_model_class=None,
        issue_event_model_class=None
    ) -> None:
        """
        启动调度器

        Args:
            sync_func: 同步函数
            interval_hours: 同步间隔（小时）
        """
        if self.scheduler is not None:
            logger.warning("Scheduler already running")
            return

        self.scheduler = BackgroundScheduler()
        self.scheduler.add_job(
            sync_func,
            trigger=IntervalTrigger(hours=interval_hours),
            id=self._sync_job_id,
            replace_existing=True,
            kwargs={
                "project_model_class": project_model_class,
                "issue_model_class": issue_model_class,
                "issue_event_model_class": issue_event_model_class
            }
        )
        self.scheduler.start()
        logger.info(f"Gitee sync scheduler started with {interval_hours}h interval")

    def stop(self) -> None:
        """停止调度器"""
        if self.scheduler is not None:
            self.scheduler.shutdown(wait=False)
            self.scheduler = None
            logger.info("Gitee sync scheduler stopped")

    def pause(self) -> None:
        """暂停调度器"""
        if self.scheduler:
            self.scheduler.pause_job(self._sync_job_id)
            logger.info("Gitee sync scheduler paused")

    def resume(self) -> None:
        """恢复调度器"""
        if self.scheduler:
            self.scheduler.resume_job(self._sync_job_id)
            logger.info("Gitee sync scheduler resumed")

    def update_interval(self, interval_hours: int, sync_func: Callable) -> None:
        """更新同步间隔"""
        if self.scheduler:
            self.scheduler.reschedule_job(
                self._sync_job_id,
                trigger=IntervalTrigger(hours=interval_hours),
                func=sync_func
            )
            logger.info(f"Gitee sync interval updated to {interval_hours}h")

    def trigger_now(self, sync_func: Callable, **kwargs) -> str:
        """
        立即触发同步

        Returns:
            任务 ID
        """
        if self.scheduler is None:
            raise RuntimeError("Scheduler not started")

        job_id = f"sync_{int(self.scheduler._created_time.timestamp() * 1000)}"
        self.scheduler.add_job(
            sync_func,
            id=job_id,
            kwargs=kwargs,
            replace_existing=True
        )
        logger.info(f"Sync job triggered: {job_id}")
        return job_id

    @property
    def is_running(self) -> bool:
        """检查调度器是否运行"""
        return self.scheduler is not None and self.scheduler.running

    def get_job_status(self) -> Dict[str, Any]:
        """获取任务状态"""
        if self.scheduler is None:
            return {"running": False, "jobs": []}

        job = self.scheduler.get_job(self._sync_job_id)
        return {
            "running": self.scheduler.running,
            "next_run_time": job.next_run_time.isoformat() if job and job.next_run_time else None,
            "job_id": self._sync_job_id
        }


_scheduler: Optional[SyncScheduler] = None


def get_scheduler() -> SyncScheduler:
    """获取调度器单例"""
    global _scheduler
    if _scheduler is None:
        _scheduler = SyncScheduler()
    return _scheduler