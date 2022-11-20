from crew_types import Card


class Task:
    """Class representing a task assigned to a player.

    If order_constraint == 0, there is no order constraint.
    If relative_constraint == False, we have an absolute order constraint.
    In this case -1 means: The task has to be completed last."""

    def __init__(self, card: Card, player: int, order_constraint=0,
                 relative_constraint: bool = False):
        if relative_constraint:
            assert order_constraint in (0, 1, 2, 3, 4)
        else:
            assert order_constraint in (-1, 0, 1, 2, 3, 4, 5)
        self.card = card
        self.player = player
        self.order_constraint: int = order_constraint
        self.relative_constraint: bool = relative_constraint


class SpecialTask:

    def __init__(self, description: str):
        self.description = description


class NoTricksWithValueTask(SpecialTask):

    def __init__(self, forbidden_value):
        super().__init__(f'No tricks may be won with cards of value '
                         f'{forbidden_value}.')
        self.forbidden_value = forbidden_value
