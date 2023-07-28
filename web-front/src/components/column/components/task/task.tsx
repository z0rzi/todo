import * as React from 'react';
import styled, { css } from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { BsFillTrashFill } from 'react-icons/bs';
import { Task } from '@utils/api';

const Container = styled.div<{ $isBeingDragged: boolean; $invisible: boolean }>`
    position: relative;
    border: 1px solid lightgray;
    border-radius: 3px;
    width: 100;
    transition: width 0.3s ease;
    padding: 8px;
    margin-bottom: 8px;
    opacity: ${(props) => (props.$invisible && !props.$isBeingDragged ? 0 : 1)};
    background-color: ${(props) =>
        props.$isBeingDragged ? 'skyblue' : 'white'};

    ${() => css`
        &:hover .trash {
            opacity: 1 !important;
        }
    `}
`;

const Title = styled.div``;
const Comment = styled.div`
    font-size: 0.8em;
    font-style: italic;
    color: #aaa;
`;

export type TaskProps = {
    task: Task;
    index: number;
    invisible?: boolean;
    onDeleteClick?: (evt: React.MouseEvent) => void;
};

export default function TaskComponent(
    props: React.PropsWithChildren<TaskProps>
) {
    return (
        <Draggable draggableId={'task-' + props.task.id} index={props.index}>
            {(provided, snapshot) => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    $isBeingDragged={snapshot.isDragging}
                    $invisible={!!props.invisible}
                >
                    {props.onDeleteClick ? (
                        <BsFillTrashFill
                            className="trash"
                            style={{
                                transitionDuration: '.3s',
                                opacity: 0,
                                cursor: 'pointer',
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                width: 15,
                                color: '#faa'
                            }}
                            onClick={(evt) => props!.onDeleteClick?.(evt)}
                        ></BsFillTrashFill>
                    ) : (
                        <div></div>
                    )}
                    <Title>{props.task.title}</Title>
                    <Comment>{props.task.comment}</Comment>
                </Container>
            )}
        </Draggable>
    );
}
