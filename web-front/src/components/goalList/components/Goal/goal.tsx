import { Goal } from '@utils/api';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { BsFillTrashFill } from 'react-icons/bs';
import styled from 'styled-components';

const Container = styled.div<{ $isBeingDragged: boolean }>`
    display: flex;
    align-items: center;
    position: relative;
    border: 1px solid lightgray;
    border-radius: 3px;
    margin-bottom: 8px;
    padding: 8px;
    cursor: pointer;
`;

export type GoalProps = {
    goal: Goal;
    index: number;
    onDelete: (goal: Goal) => void;
};

export default function GoalComponent(
    props: React.PropsWithChildren<GoalProps>
) {
    return (
        <Draggable draggableId={props.goal.id.toString()} index={props.index}>
            {(provided, snapshot) => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    $isBeingDragged={snapshot.isDragging}
                >
                    <BsFillTrashFill
                        style={{
                            cursor: 'pointer',
                            width: 15,
                            color: '#faa',
                            marginRight: 5
                        }}
                        onClick={() => props!.onDelete?.(props.goal)}
                    ></BsFillTrashFill>
                    {props.goal.title}
                </Container>
            )}
        </Draggable>
    );
}
