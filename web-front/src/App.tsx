import List from '@utils/List';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import styled from 'styled-components';
import './App.css';
import ColumnComponent, { Column } from './components/column/column';
import GoalList from './components/goalList/goalList';
import TaskEditComponent, { PosRect } from './components/taskEdit/taskEdit';
import Api, { Goal, Task } from './utils/api';
import Dict from './utils/Dict';
import { debounce } from './utils/toolbox';
import Cookies from 'js-cookie';

const Container = styled.div`
    width: 100%;
    display: flex;
`;

const dows = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thrusday',
    'Friday',
    'Saturday'
];

function generateColumns(): Dict<string, Column> {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    while (d.getDay() !== 1) {
        d.setUTCDate(d.getUTCDate() - 1);
    }

    const cols = new Dict<string, Column>();

    const colSlug = dows[d.getDay()] + '-' + d.getDate();

    let colName = dows[d.getDay()];
    colName += ' ' + d.getDate();
    colName += ['st', 'nd', 'rd'][d.getDate() - 1] || 'th';

    cols.set(colSlug, {
        slug: colSlug,
        title: colName,
        tasks: new List(),
        date: new Date(d)
    });

    d.setUTCDate(d.getUTCDate() + 1);

    while (d.getDay() !== 1) {
        const colSlug = dows[d.getDay()] + '-' + d.getDate();

        let colName = dows[d.getDay()];
        colName += ' ' + d.getDate();
        colName += ['st', 'nd', 'rd'][d.getDate() - 1] || 'th';

        cols.set(colSlug, {
            slug: colSlug,
            title: colName,
            tasks: new List(),
            date: new Date(d)
        });

        d.setUTCDate(d.getUTCDate() + 1);
    }

    return cols;
}

export default function App() {
    const [popupData, updatePopupData] = useState(
        {} as { task: Task | null; alignOn?: PosRect }
    );
    const [columns, updateColumns] = useState(generateColumns);
    const [goalList, updateGoalList] = useState(new List<Goal>());
    const [apiKey, updateApiKey] = useState(Cookies.get('ACCESS_TOKEN') || '');

    const api = useRef(Api.getInstance(apiKey));

    useEffect(() => {
        api.current = Api.getInstance(apiKey);
        Cookies.set('ACCESS_TOKEN', apiKey)
    }, [apiKey]);

    useEffect(() => {
        api.current
            .getAllGoals()
            .then((goals) => {
                updateGoalList(goals);
            })
            .catch((err) => {
                console.log(err);
            });

        api.current
            .getAllTasks()
            .then((tasks) => {
                const cols = columns.clone();
                cols.forEach((col, key) => {
                    cols.set(key, {
                        ...col,
                        tasks: new List()
                    });
                });
                for (const task of tasks) {
                    for (const [, col] of cols) {
                        const dateStart = +col.date;
                        const dateEnd = dateStart + 1000 * 60 * 60 * 24;

                        if (dateStart <= +task.date && +task.date < dateEnd) {
                            col.tasks.insert(task);
                            break;
                        }
                    }
                }
                updateColumns(cols);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [apiKey]);

    /**
     * Handles the dropping of tasks and goals.
     */
    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination || destination.droppableId.startsWith('tree')) return;

        if (draggableId.startsWith('task')) {
            // We're dragging a task

            if (destination == null) return;

            if (/--\d+$/.test(draggableId)) {
                // It's a new task, which has been "pulled" from a goal
                const destColumn = columns.get(destination.droppableId);
                if (!destColumn) return;

                const goal = goalList.get(source.index);
                const date = destColumn.date;

                const task: Task = {
                    id: -1,
                    title: goal.title,
                    date,
                    duration: -1,
                    dateCreated: new Date()
                };

                api.current.addTask(goal.title, date).then((apiTask) => {
                    // Replacing task with actually created task in the state.
                    const destNewTasks = destColumn.tasks.clone();
                    destNewTasks.insert(apiTask, destination.index);

                    const newCols = columns.clone();
                    newCols.set(destination.droppableId, {
                        ...destColumn,
                        tasks: destNewTasks
                    });

                    updateColumns(newCols);
                });

                const destNewTasks = destColumn.tasks.clone();
                destNewTasks.insert(task, destination.index);

                const newCols = columns.clone();
                newCols.set(destination.droppableId, {
                    ...destColumn,
                    tasks: destNewTasks
                });

                updateColumns(newCols);
                return;
            }

            if (
                source.droppableId === destination.droppableId &&
                source.index === destination.index
            ) {
                // It didn't move
                return;
            }

            // We're moving a task between days or within a same day

            let sourceTasks = columns.get(source.droppableId)?.tasks;
            let destTasks = columns.get(destination.droppableId)?.tasks;

            if (!sourceTasks || !destTasks) return;

            if (source.droppableId === destination.droppableId) {
                // It's the same column
                sourceTasks = sourceTasks.clone();
                destTasks = sourceTasks;
            } else {
                // It's a different column
                const task = sourceTasks.get(source.index);
                api.current
                    .updateTask(task.id, {
                        date: columns.get(destination.droppableId)?.date
                    })
                    .then((apiTask) => {
                        console.log(apiTask);
                    });
                sourceTasks = sourceTasks.clone();
                destTasks = destTasks.clone();
            }

            sourceTasks.move(source.index, destination.index, destTasks);

            const newCols = columns.clone();

            newCols.set(source.droppableId, {
                ...(columns.get(source.droppableId) as Column),
                tasks: sourceTasks
            });
            newCols.set(destination.droppableId, {
                ...(columns.get(destination.droppableId) as Column),
                tasks: destTasks
            });

            updateColumns(newCols);
        } else {
            // We're dragging a goal
            const goal = goalList.get(source.index);
            const newImportance = goalList.get(destination.index).importance;

            api.current.moveGoal(goal.id, newImportance).then((newGoals) => {
                if (!goalList.deepSameAs(newGoals)) updateGoalList(newGoals);
            });

            const newList = goalList
                .clone()
                .move(source.index, destination.index);

            newList.forEach((goal, idx) => {
                goal.importance = newList.length - idx;
            });

            updateGoalList(newList);
        }
    };

    // When popup moves, we add a new click listener on the document to erase it
    useEffect(() => {
        function onBlur(evt: MouseEvent) {
            let target = evt.target as HTMLElement;
            while (target) {
                if (
                    target.classList.contains('task') ||
                    target.classList.contains('task-edit-pop')
                ) {
                    return;
                }

                target = target.parentElement as HTMLElement;
            }

            // Now, we're sure that the click was not on a task or on the task-edit popup.

            document.removeEventListener('mousedown', onBlur);
            updatePopupData({ alignOn: popupData.alignOn, task: null });
        }

        if (!popupData?.task) return;

        document.addEventListener('mousedown', onBlur);

        return () => {
            document.removeEventListener('mousedown', onBlur);
        };
    }, [popupData]);

    /**
     * Called when the user clicks on a task.
     *
     * Updates the popup position and content
     */
    function onTaskClick(domTask: HTMLElement, task: Task) {
        let relativeParent = domTask.parentElement as HTMLElement;

        try {
            while (!relativeParent.classList.contains('columns-container'))
                relativeParent = relativeParent.parentElement as HTMLElement;
        } catch (_) {
            throw new Error(
                'Could not find the columns container... Maybe someone changed its class name?'
            );
        }

        const parentRect = relativeParent.getBoundingClientRect();
        const taskRect = domTask.getBoundingClientRect();

        const relativePos = {
            x: taskRect.x - parentRect.x,
            y: taskRect.y - parentRect.y,
            w: taskRect.width,
            h: taskRect.height
        };

        updatePopupData({ alignOn: relativePos, task: task });
    }

    /**
     * Called when a task is removed
     */
    function onTaskDelete(taskToDelete: Task) {
        const newCols = columns.clone();
        for (const [colId, column] of newCols) {
            for (let taskIdx = 0; taskIdx < column.tasks.length; taskIdx++) {
                const task = column.tasks.get(taskIdx);
                if (task.id === taskToDelete.id) {
                    // We found the modified task!
                    api.current.deleteTask(taskToDelete.id).catch(() => {
                        // There was a problem, we revert to the previous state

                        updateColumns(columns);
                        return;
                    });

                    const newTasks = column.tasks.clone();
                    newTasks.delete(task);

                    newCols.set(colId, {
                        ...column,
                        tasks: newTasks
                    });

                    updateColumns(newCols);

                    if (popupData.task) {
                        updatePopupData({
                            ...popupData,
                            task: null
                        });
                    }

                    return;
                }
            }
        }
    }

    /**
     * Called when a task is changed (its date, description or title)
     */
    function onTaskChange(taskId: number, newTask: Task) {
        updatePopupData({
            ...popupData,
            task: newTask
        });
        const newCols = columns.clone();
        for (const [colId, column] of newCols) {
            for (let taskIdx = 0; taskIdx < column.tasks.length; taskIdx++) {
                const task = column.tasks.get(taskIdx);
                if (task.id === taskId) {
                    // We found the modified task!
                    const newTasks = column.tasks.clone();
                    newTasks.set(taskIdx, newTask);

                    newCols.set(colId, {
                        ...column,
                        tasks: newTasks
                    });

                    if (newTask.title.length > 3) {
                        debounce('task-update', () => {
                            api.current.updateTask(taskId, {
                                title: newTask.title,
                                comment: newTask.comment,
                                duration: newTask.duration
                            });
                        });
                    }

                    updateColumns(newCols);
                    return;
                }
            }
        }
    }

    /**
     * Called when a new goal is created
     */
    function onGoalCreate(goalTitle: string) {
        api.current
            .addGoal(goalTitle)
            .then((newGoal) => {
                const newList = goalList.clone();
                newList.insert(newGoal, 0);
                updateGoalList(newList);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Called when a goal is deleted
     */
    function onGoalDelete(goal: Goal) {
        api.current
            .deleteGoal(goal.id)
            .then(() => {
                const newList = new List([...goalList.arr]);
                newList.delete(goal);
                updateGoalList(newList);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Container>
                    <div style={{ width: '20%' }}>
                        <GoalList
                            onGoalCreate={onGoalCreate}
                            onGoalDelete={onGoalDelete}
                            goals={goalList}
                        ></GoalList>
                    </div>
                    <div
                        className="columns-container"
                        style={{
                            width: '80%',
                            display: 'flex',
                            flexWrap: 'wrap',
                            position: 'relative'
                        }}
                    >
                        {columns.map((column, colSlug) => {
                            return (
                                <ColumnComponent
                                    key={colSlug}
                                    {...column}
                                    onTaskClick={onTaskClick}
                                    onTaskDelete={onTaskDelete}
                                ></ColumnComponent>
                            );
                        })}
                        <TaskEditComponent
                            {...popupData}
                            onTaskChange={onTaskChange}
                            key="task-edit-popup"
                        ></TaskEditComponent>
                    </div>
                </Container>
            </DragDropContext>
            <input
                type="text"
                placeholder="Your api key"
                style={{ position: 'absolute', bottom: 0, right: 0 }}
                defaultValue={apiKey}
                onBlur={(evt) => {
                    updateApiKey(evt.target.value);
                }}
            />
        </div>
    );
}
