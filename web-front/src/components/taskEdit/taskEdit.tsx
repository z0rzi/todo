import { Task } from '@utils/api';
import { useRef } from 'react';
import styled from 'styled-components';

const popUpWidth = 200;

const Container = styled.div.attrs({ className: 'task-edit-pop' })<{
    $pos?: { x?: number; y?: number; w?: number };
    $visible?: boolean;
}>`
    left: ${(props) => props?.$pos?.x || '0'}px;
    top: ${(props) => props?.$pos?.y || '0'}px;
    transition: opacity .3s ease, visibility 0s .${props => props.$visible?0:3}s ease;
    opacity: ${(props) => (props.$visible ? 1 : 0)};
    visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
    position: absolute;
    border: 1px solid lightgray;
    border-radius: 3px;
    background: white;
    width: ${popUpWidth}px;
`;

export type PosRect = {
    x: number;
    y: number;
    w?: number;
    h?: number;
};

export type TaskEditProps = {
    task: Task | null;
    alignOn?: PosRect;
    onTaskChange: (taskId: number, newTask: Task) => void;
};

export default function TaskEditComponent(props: TaskEditProps) {
    const lastTask = useRef(props.task || null);

    if (props.task) lastTask.current = props.task;

    if (!props.alignOn) return <Container $visible={false}>PopUp!</Container>;

    const popupPos = {} as PosRect;

    popupPos.y = props.alignOn.y;
    if (props.alignOn.x < popUpWidth + 20) {
        popupPos.x = props.alignOn.x + (props.alignOn.w || 0) + 5;
    } else {
        popupPos.x = props.alignOn.x - popUpWidth - 5;
    }

    const task = props.task || lastTask.current || null;

    if (!task)
        return (
            <Container $visible={false} $pos={popupPos}>
                PopUp!
            </Container>
        );

    function onTitleChange(newTitle: string) {
        if (!props.task) return;

        const newTask = { ...props.task };

        newTask.title = newTitle;
        props.onTaskChange(props.task.id, newTask);
    };

    function onCommentChange(newComment: string) {
        if (!props.task) return;

        const newTask = { ...props.task };

        newTask.comment = newComment;
        props.onTaskChange(props.task.id, newTask);
    };

    return (
        <Container $pos={popupPos} $visible={!!props.task}>
            <div>
                <input
                    style={{
                        width: '100%',
                        border: 0,
                        padding: '10px'
                    }}
                    type="text"
                    placeholder="Title"
                    value={task?.title}
                    onChange={(evt) => onTitleChange(evt.target.value)}
                />
            </div>
            <div>
                <textarea
                    style={{
                        width: '100%',
                        border: 0,
                        padding: '10px'
                    }}
                    placeholder="Description"
                    value={task?.comment}
                    onChange={(evt) => onCommentChange(evt.target.value)}
                />
            </div>
        </Container>
    );
}
