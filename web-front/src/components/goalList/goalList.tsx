import { Goal, Task } from '@utils/api';
import List from '@utils/List';
import { PropsWithChildren } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import TaskComponent from '../column/components/task/task';
import GoalComponent from './components/Goal/goal';

const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const AddField = styled.input.attrs({ type: 'text', placeholder: 'New Goal' })`
    width: 100%;
    margin-bottom: 10px;
`;

export type GoalListProps = {
    goals: List<Goal>;
    onGoalDelete: (goal: Goal) => void;
    onGoalCreate: (goalTitle: string) => void;
};

export default function GoalList(props: PropsWithChildren<GoalListProps>) {
    function keyDown(evt: React.KeyboardEvent) {
        if (evt.key !== 'Enter') return;

        const target = evt.target as HTMLInputElement;
        const goalTitle = target.value;

        props.onGoalCreate(goalTitle);

        target.value = '';
    }

    return (
        <Container>
            <AddField onKeyDown={keyDown}></AddField>
            <Droppable droppableId="hidden-task-list" type="TASKS">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ position: 'absolute', width: 'calc(100% - 30px)', left: '30px', zIndex: 5 }}
                    >
                        {props.goals.map((goal) => {
                            const task: Task = {
                                id: -1 * goal.id,
                                title: goal.title,
                                date: new Date(),
                                duration: -1,
                                dateCreated: new Date()
                            };

                            return (
                                <TaskComponent
                                    key={goal.id.toString()}
                                    index={props.goals.length - goal.importance - 1}
                                    task={task}
                                    invisible={true}
                                ></TaskComponent>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <Droppable droppableId="goals-list" type="GOALS">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {props.goals.map((goal, idx) => (
                            <GoalComponent
                                onDelete={props.onGoalDelete}
                                index={idx}
                                key={goal.id.toString()}
                                goal={goal}
                            ></GoalComponent>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </Container>
    );
}
