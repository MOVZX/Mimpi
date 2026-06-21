"""Mimpi Dashboard — Structured JSON Logging Configuration

Provides structured JSON logging for better debugging in production environments.
Log entries include timestamp, level, module, function, line number, and optional exception details.
"""

import json
import logging
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record):
        """Format log record as JSON."""
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": logging.Formatter.formatException(record.exc_info),
            }
        # Add extra fields if present
        if hasattr(record, "extra_fields"):
            log_entry.update(record.extra_fields)
        return json.dumps(log_entry, default=str)


def setup_logging(level: str = "INFO", json_format: bool = True):
    """Configure structured logging for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_format: If True, use JSON formatting; otherwise use standard format
    """
    # Create formatter
    if json_format:
        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Add console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Add file handler for production
    try:
        from server.config import PROJECT_DIR
        log_file = PROJECT_DIR / "logs" / "mimpi.log"
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except Exception:
        pass  # File logging is optional
    
    return root_logger
