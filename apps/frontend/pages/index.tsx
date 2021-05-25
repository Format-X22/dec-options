import React, { useEffect, Dispatch, SetStateAction } from 'react';
import getOptions, { TResponseData } from '../helpers/getOptions';
import { Option } from '@app/shared/option.schema';
import { Col, Row, Table, Layout } from 'antd';
import format from 'date-fns/format';
import { Pagination } from '@app/shared/list.dto';
import { getOptionsParamsList, OptionsParamsList } from '../helpers/getOptionsParamsList';
import { BasicProps } from 'antd/lib/layout/layout';
import { FilterValue, SortOrder, TablePaginationConfig } from 'antd/lib/table/interface';
import upperFirst from 'lodash/upperFirst';
import { market } from '../helpers/market';

export type TFilters = {
    filterByMarket?: string;
    filterByMarketType?: string;
    filterByType?: string;
};
export type TSorter = {
    columnKey: string | number;
    order: SortOrder;
};
type TFilter = {
    text: string;
    value: string;
};
type TColumnBinding = {
    title: string;
    dataIndex: string;
    key?: string;
    render?: (_: unknown, r: Option) => string;
    sortDirections?: Array<SortOrder>;
    sorter?: boolean;
    filters?: Array<TFilter>;
    filterMultiple?: boolean;
};
type TDataSource = Option & { key: Option['_id'] };
type TProps = {
    props: {
        options: Array<Option>;
        initialPagination: Pagination;
        optionsParamsList: OptionsParamsList;
    };
};
type TSetter<T> = Dispatch<SetStateAction<T>>;
type TInitialArgs = {
    options: Array<Option>;
    initialPagination: Pagination;
    optionsParamsList: OptionsParamsList;
};

const { Content }: { Content: React.FC<BasicProps> } = Layout;
const columns: Array<TColumnBinding> = [
    {
        title: 'Market Type',
        dataIndex: 'marketType',
        key: 'marketType',
        sorter: true,
        filterMultiple: false,
        filters: [
            {
                value: 'CEX',
                text: 'CEX',
            },
            {
                value: 'DEX',
                text: 'DEX',
            },
        ],
    },
    {
        title: 'Market',
        dataIndex: 'market',
        key: 'market',
        sorter: true,
        filterMultiple: false,
    },
    {
        title: 'Base',
        dataIndex: 'base',
        key: 'base',
    },
    {
        title: 'Quote',
        dataIndex: 'quote',
        key: 'quote',
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        sorter: true,
        filterMultiple: false,
        filters: [
            {
                value: 'PUT',
                text: 'PUT',
            },
            {
                value: 'CALL',
                text: 'CALL',
            },
        ],
    },
    {
        title: 'Strike Asset',
        dataIndex: 'strikeAsset',
        key: 'strikeAsset',
    },
    {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        render: (_: unknown, r: Option): string => `${r.size} ${r.base}`,
        sorter: true,
    },
    {
        title: 'Strike',
        dataIndex: 'strike',
        key: 'strike',
        render: (_: unknown, r: Option): string => `${r.strike} ${r.quote}`,
        sorter: true,
    },
    {
        title: 'Expiration Date',
        dataIndex: 'expirationDate',
        key: 'expirationDate',
        render: (expirationDate: string): string => format(new Date(expirationDate), 'yyyy/MM/dd'),
        sorter: true,
    },
];

function Home({ options = [], initialPagination, optionsParamsList }: TInitialArgs): JSX.Element {
    const [optionsList, setOptionsList]: [Array<Option>, TSetter<Array<Option>>] = React.useState<
        Array<Option>
    >(options);
    const [pagination, setPagination]: [Pagination, TSetter<Pagination>] = React.useState<Pagination>(
        initialPagination,
    );
    const [markets]: [OptionsParamsList['market'], TSetter<OptionsParamsList['market']>] = React.useState<
        Array<string>
    >(optionsParamsList.market);
    const [filters, setFilters]: [TFilters, TSetter<TFilters>] = React.useState<TFilters>({
        filterByMarket: '',
        filterByMarketType: '',
        filterByType: '',
    });
    const [sorter, setSorter]: [TSorter, TSetter<TSorter>] = React.useState<TSorter>({
        columnKey: '',
        order: null,
    });

    async function requestData(): Promise<void> {
        try {
            const _filters: TFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]: [string, string]): boolean => !!value),
            );
            const { order, columnKey }: TSorter = sorter;
            const _sorter: Record<string, string> = {};

            if (order) {
                const sortKey: string = `sortBy${upperFirst(`${columnKey}`)}`;

                if (order === 'ascend') {
                    _sorter[sortKey] = 'ASC';
                } else {
                    _sorter[sortKey] = 'DESC';
                }
            }

            const {
                data,
                pagination: incPagination,
            }: { data: Array<Option>; pagination: Pagination } = await getOptions({
                limit: pagination.limit,
                offset: pagination.offset,
                ..._filters,
                ..._sorter,
            });
            setOptionsList(data);
            setPagination(incPagination);
        } catch (error) {
            console.error(error);
        }
    }

    function onTableSortFilterChange(
        _pagination: TablePaginationConfig,
        _filters: FilterValue,
        _sorter: TSorter,
    ): void {
        const { current: page, pageSize }: TablePaginationConfig = _pagination;
        setPagination({
            ...pagination,
            offset: (page - 1) * pageSize,
            limit: pageSize,
        });
        const { columnKey, order }: TSorter = _sorter;
        setSorter({
            columnKey,
            order,
        });

        const nextFilters: TFilters = { ...filters };

        Object.keys(_filters).map((key: string): void => {
            const value: string = _filters[key]?.[0] || '';

            nextFilters[`filterBy${upperFirst(key)}`] = value && value !== 'all' ? value : '';
        });
        setFilters(nextFilters);
    }

    useEffect((): void => {
        requestData().catch();
    }, [pagination.offset, pagination.limit, filters, sorter]);

    const dataSource: Array<TDataSource> = optionsList.map(
        (optionsData: Option): TDataSource => ({ ...optionsData, key: optionsData._id }),
    );

    columns.forEach((column: TColumnBinding): void => {
        if (column.key !== 'market') {
            return;
        }

        column.filters = markets.map((value: string): TFilter => ({ value, text: value }));
    });

    return (
        <Layout>
            <Content>
                <Row gutter={[8, 8]} style={{ width: '100%', padding: 20 }}>
                    <Col span={24}>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={{
                                pageSize: pagination.limit,
                                total: pagination.total,
                                showSizeChanger: true,
                            }}
                            sticky
                            // @ts-ignore
                            onChange={onTableSortFilterChange}
                        />
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export async function getServerSideProps(): Promise<TProps> {
    const { data, pagination }: TResponseData = await getOptions({ offset: 0, limit: 20 });
    const optionsParamsList: OptionsParamsList = await getOptionsParamsList();

    return { props: { options: data, initialPagination: pagination, optionsParamsList } };
}

export default Home;
