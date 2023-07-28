import { Task } from '@/utils/api';
import List from '@utils/List';
import React, { PropsWithChildren } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import TaskComponent from './components/task/task';

const Container = styled.div`
    flex: 1;
    min-width: 300px;
    color: #222;
    margin: 8px;
    border: 1px solid lightgray;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h3`
    padding: 8px;
`;

const TaskList = styled.div<{ $isTaskOver: boolean }>`
    height: 100%;
    min-height: 150px;
    padding: 8px;
    background: ${(props) => (props.$isTaskOver ? '#f7f3dc' : 'white')};
    flex-grow: 1;
`;

export type Column = {
    title: string;
    tasks: List<Task>;
    slug: string;
    date: Date;
};

export type ColumnProps = Column & {
    onTaskClick?: (domTask: HTMLElement, task: Task) => void;
    onTaskDelete?: (task: Task) => void;
};

export default function ColumnComponent(props: PropsWithChildren<ColumnProps>) {
    function onTaskClick(evt: React.MouseEvent, task: Task) {
        let domTask = evt.target as HTMLElement;

        try {
            while (!domTask.classList.contains('task'))
                domTask = domTask.parentElement as HTMLElement;
        } catch (err) {}

        if (props.onTaskClick) props.onTaskClick(domTask, task);
    }

    function onDeleteClick(evt: React.MouseEvent, task: Task): void {
        evt.preventDefault();
        evt.stopPropagation();

        if (props.onTaskDelete) props.onTaskDelete(task);
    }

    return (
        <Container>
            <Title>{props.title}</Title>
            <Droppable droppableId={props.slug} type="TASKS">
                {(provided, snapshot) => (
                    <TaskList
                        $isTaskOver={snapshot.isDraggingOver}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {props.tasks.map((task, idx) => (
                            <div
                                key={task.id}
                                className="task"
                                onClick={(evt: React.MouseEvent) => {
                                    onTaskClick(evt, task);
                                }}
                            >
                                <TaskComponent
                                    index={idx}
                                    task={task}
                                    onDeleteClick={(evt) =>
                                        onDeleteClick(evt, task)
                                    }
                                ></TaskComponent>
                            </div>
                        ))}
                        {provided.placeholder}
                    </TaskList>
                )}
            </Droppable>
        </Container>
    );
}
