import { useSelector } from '../../../hooks';
import { insightAction } from '../../../modules/insightSlice';
import { HeaderMenu } from '../Menu';
import HeaderIcon from './HeaderIcon';
import Style from './index.module.less';
import { selectGlobal, toggleMenu } from 'modules/global';
import { useAppDispatch, useAppSelector } from 'modules/store';
import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewListIcon } from 'tdesign-icons-react';
import { Button, Col, Layout, MessagePlugin, Row, Select } from 'tdesign-react';
import { useFetchClusterListQuery } from '../../../services/clusterApi';
import { removeUserInfo } from 'utils/user';
const { Header } = Layout;

export default memo((props: { showMenu?: boolean }) => {
  const { t } = useTranslation();
  const globalState = useAppSelector(selectGlobal);
  const dispatch = useAppDispatch();
  const selectedClusterId = useSelector((state) => state.insight.selectedClusterId);
  const clusterList = useFetchClusterListQuery({});
  const navigate = useNavigate();
  const location = useLocation();

  const IsAdmin = JSON.parse(localStorage.getItem('userInfo'))?.IsAdmin || false;
  const Clusters = JSON.parse(localStorage.getItem('userInfo'))?.Clusters || [];
  console.log('=-===Clusters', Clusters);
  console.log('IsAdmin', IsAdmin);

  useEffect(() => {
    let items = clusterList?.data?.data?.items;
    // 如果是管理员,显示全部的集群
    if (IsAdmin) {
      console.log('===============来这里====================');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (selectedClusterId === '' && items?.length > 0) {
        console.log('显示显示');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dispatch(insightAction.selectedClusterId(items[0].id));
      }

      if (items?.length === 0) {
        console.log('返回返回');
        dispatch(insightAction.selectedClusterId(''));
        if (location.pathname !== '/login') {
          MessagePlugin.error(
            {
              // content: t('添加一个集群以启用Dashboard'),
              content: t('需要添加一个集群以启用Dashboard,请联系管理员添加集群'),
              closeBtn: true,
            },
            10000,
          );
          // navigate('/settings/cluster');
          removeUserInfo();
          navigate('/login');
          window.location.reload();
        }
      }
    }
    // 否则,只显示已配置的集群
    else {
      console.log('===============来我这====================');
      // 筛选集群列表
      console.log('Clusters', Clusters);
      console.log('clusterList', items);
      const filteredClusters = items?.filter((item) => Clusters.includes(item.id));
      console.log('filteredClusters', filteredClusters);

      if (selectedClusterId === '' && filteredClusters?.length > 0) {
        console.log('显示显示');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dispatch(insightAction.selectedClusterId(filteredClusters[0].id));
      }

      if (filteredClusters?.length === 0) {
        console.log('返回返回');
        dispatch(insightAction.selectedClusterId(''));
        if (location.pathname !== '/login') {
          MessagePlugin.error(
            {
              // content: t('添加一个集群以启用Dashboard'),
              content: t('需要添加一个集群以启用Dashboard,请联系管理员添加集群'),
              closeBtn: true,
            },
            10000,
          );
          removeUserInfo();
          // navigate('/settings/cluster');
          navigate('/login');
          window.location.reload();
        }
      }
    }
  });

  // const options = React.useMemo(
  //   () =>
  //     (clusterList.data?.data?.items ?? []).map((item) => ({
  //       text: `${item.name} (${item.id})`,
  //       value: item.id,
  //     })),
  //   [clusterList.data?.data?.items],
  // );
  const options = React.useMemo(() => {
    const items = clusterList.data?.data?.items ?? [];

    const filteredItems = IsAdmin ? items : items.filter((item) => Clusters.includes(item.id));

    return filteredItems.map((item) => ({
      text: `${item.name} (${item.id})`,
      value: item.id,
    }));
  }, [clusterList.data?.data?.items, IsAdmin, Clusters]);

  if (!globalState.showHeader) {
    return null;
  }

  let HeaderLeft;
  if (props.showMenu) {
    HeaderLeft = (
      <div>
        <HeaderMenu />
      </div>
    );
  } else {
    HeaderLeft = (
      <Row gutter={16} align='middle'>
        <Col>
          <Button shape='square' size='large' variant='text' onClick={() => dispatch(toggleMenu(null))}>
            <ViewListIcon />
          </Button>
        </Col>
        <Col>
          <Select
            empty={t('暂无数据')}
            placeholder={t('请选择集群')}
            style={{ width: '200px' }}
            value={selectedClusterId}
            onChange={(value: any) => {
              dispatch(insightAction.selectedClusterId(value));
            }}
          >
            {options.map((option) => (
              <Select.Option key={option.value} label={option.text} value={option.value} />
            ))}
          </Select>
        </Col>
        {/* <Col> */}
        {/*  <Search /> */}
        {/* </Col> */}
      </Row>
    );
  }

  return (
    <Header className={Style.panel}>
      {HeaderLeft}
      <HeaderIcon />
    </Header>
  );
});
