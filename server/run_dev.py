import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import time
import signal

class RestartHandler(FileSystemEventHandler):
    def __init__(self):
        self.process = None
        self.restart_server()

    def restart_server(self):
        # Kill existing process if it exists
        if self.process:
            os.kill(self.process.pid, signal.SIGTERM)
            self.process.wait()

        # Start new process
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['FLASK_DEBUG'] = '1'
        self.process = subprocess.Popen(['python', 'api.py'], env=env)
        print("\n🚀 Server restarted!")

    def on_modified(self, event):
        if event.src_path.endswith('.py'):
            print(f"\n⚡ Detected change in {event.src_path}")
            self.restart_server()

def run_dev_server():
    handler = RestartHandler()
    observer = Observer()
    observer.schedule(handler, path='.', recursive=True)
    observer.start()

    print("🔥 Development server started with hot reload")
    print("👀 Watching for file changes...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down development server...")
        if handler.process:
            os.kill(handler.process.pid, signal.SIGTERM)
        observer.stop()
    observer.join()

if __name__ == "__main__":
    run_dev_server() 