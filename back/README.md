DB:
    Goals
        id:           number
        title:        string
        comment:      string
        completed:    boolean
        parent:       goal.id
        tags:         'home' | 'transit' | 'computer' | 'growth' | 'Work'
        importance:     number
        created_date: Date

    Task
        completed: boolean
        goal:      goal.id
        date:      Date
        title:     string
        comment:   string
        location:  string

paths:
    GET /goals
        get all goals

    GET /goal/{id}
        get infos about a specific goal

    DELETE /goal/{id}
        Remove this specific goal and its attached tasks 😢

    POST /goal
        Create a new goal

    PUT /goal/{id}
        Updates a goal (including completing it)

    POST /goal/{id}
        Create a new sub-goal

    POST /goal/{id}/task
        Create a new task

    GET /goal/{id}/tasks
        Get all tasks attached to this goal

    GET /tasks
        Get all non-completed tasks

    DELETE /task/{id}
        Remove this specific task 😢

    PUT /task/{id}
        Updates a task (including completing it)

Notes:
    -> It is possible to create a Task which doesn't have a parent goal.
