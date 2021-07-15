import { FC, useRef, useEffect, Ref } from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';

type TablePartProps = {
    row?: boolean;
    noTable?: boolean;
    reverse?: boolean;
    header?: boolean;
    children: JSX.Element;
    ref?: Ref<HTMLDivElement>;
};

const TablePartContainer: FC<TablePartProps> = styled.div`
    display: flex;
    flex-direction: ${({ row }: TablePartProps) => (row ? 'row' : 'column')};
    width: 100%;
    height: 100%;
    background: ${$backgroundLight};
    ${({ noTable }: TablePartProps) => noTable && `padding: 24px 0`};
    ${({ reverse }: TablePartProps) => reverse && 'align-items: flex-end;'};

    @media (max-width: 680px) {
        display: block;
        overflow-y: hidden;
        overflow-x: scroll;
    }
`;

const TablePartContent: FC<TablePartProps> = styled.div`
    display: flex;
    flex-direction: inherit;
    width: 100%;
    height: 100%;
    align-items: inherit;
    justify-content: inherit;

    @media (max-width: 680px) {
        ${({ header }: TablePartProps) => !header && `min-width: 250px`};
    }
`;

export function TablePart(props: TablePartProps): JSX.Element {
    const { children, ...rest } = props;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function scrollToRight(): void {
            ref?.current?.scroll(1000, 0);
        }
        if (!props.reverse && !props.header && !props.noTable) {
            scrollToRight();
            window.addEventListener('resize', scrollToRight);
        }

        return () => {
            window.removeEventListener('resize', scrollToRight);
        };
    }, []);

    return (
        <TablePartContainer {...rest} ref={ref}>
            <TablePartContent {...rest}>{children}</TablePartContent>
        </TablePartContainer>
    );
}
