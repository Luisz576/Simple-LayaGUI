from model import SystemOneModel
from laya import Router

class LayaSOM(SystemOneModel):
    def __init__(self):
        super().__init__()
        self.router = Router(preload=True)

    def question(self, state, choices):
        return self.router.predict(state, choices)
