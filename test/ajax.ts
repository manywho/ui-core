import test from 'ava';
import * as mock from 'xhr-mock';
import * as FormData from 'form-data';
import Ajax from '../js/services/ajax';
import Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.before(t => {
    mock.setup();

    Settings.initialize({
        platform: {
            uri: 'https://flow.manywho.com'
        }
    }, null);

    t.pass();
});

const stateId = 'stateId';
const tenantId = 'tenantId';
const token = 'token';
const stateToken = 'stateToken';

const expectedHeaders = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    authorization: token,
    'content-type': 'application/json',
    manywhotenant: tenantId
};

const expectedStateHeaders = Object.assign({}, expectedHeaders, {
    manywhostate: stateId
});

test.cb('Login', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/authentication/${stateId}`;
    const expected = {
        username: 'username',
        password: 'password',
        token: null,
        sessionToken: 'sessionId',
        sessionUrl: 'sessionUrl',
        loginUrl: 'loginUrl'
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(expected));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'content-type': 'application/json',
            manywhotenant: tenantId
        });
        t.end();
        return res.status(200).body();
    });

    Ajax.login(expected.loginUrl, expected.username, expected.password, expected.sessionToken, expected.sessionUrl, stateId, tenantId);
});

test.cb('Initialize', t => {
    t.plan(4);

    const url = 'https://flow.manywho.com/api/run/1';
    const request = {
        flowId: {
            id: 'id',
            versionId: 'versionId'
        }
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(request));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.initialize(request, tenantId, token);
});

test.cb('Flow Out', t => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/out/${stateId}/outcomeId`;

    mock.post(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.flowOut(stateId, tenantId, 'outcomeId', token);
});

test.cb('Join', t => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.join(stateId, tenantId, token);
});

test.cb('Invoke', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}`;
    const request = {
        stateId: stateId
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(request));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.invoke(request, tenantId, token);
});

test.cb('Get Navigation', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/navigation/${stateId}`;
    const request = {
        stateId: stateId,
        stateToken: stateToken,
        navigationElementId: 'navigationElementId'
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(request));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getNavigation(stateId, stateToken, request.navigationElementId, tenantId, token);
});

test.cb('Get Flow By Name', t => {
    t.plan(3);

    const flowName = 'myflow';
    const url = `https://flow.manywho.com/api/run/1/flow/name/${flowName}`;
    const request = {
        stateId: stateId
    };

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getFlowByName(flowName, tenantId, token);
});

test.cb('ObjectData Request', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/service/1/data`;
    const expected = {
        listFilter: {
            search: 'search',
            limit: 10,
            orderByPropertyDeveloperName: 'orderBy',
            orderByDirectionType: 'ASC',
            offset: 20
        }
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(expected));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.dispatchObjectDataRequest({}, tenantId, stateId, token, expected.listFilter.limit, expected.listFilter.search, expected.listFilter.orderByPropertyDeveloperName, expected.listFilter.orderByDirectionType, 3);
});

test.cb('FileData Request', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/service/1/file`;
    const expected = {
        listFilter: {
            search: 'search',
            limit: 10,
            orderByPropertyDeveloperName: 'orderBy',
            orderByDirectionType: 'ASC',
            offset: 20
        }
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(expected));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.dispatchFileDataRequest({}, tenantId, stateId, token, expected.listFilter.limit, expected.listFilter.search, expected.listFilter.orderByPropertyDeveloperName, expected.listFilter.orderByDirectionType, 3);
});

test.cb('Upload File', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/service/1/file/content`;
    const formData = new FormData();
    formData.append('key', 'value');

    mock.post(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.uploadFile(formData, tenantId, token, null);
});

test.cb('Upload Social File', t => {
    t.plan(4);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}/file`;
    const formData = new FormData();
    formData.append('key', 'value');

    mock.post(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.uploadSocialFile(formData, streamId, tenantId, token, null);
});

test.cb('Session Authentication', t => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/authentication/${stateId}`;

    const expected = {
        session: 'session'
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(expected));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.sessionAuthentication(tenantId, stateId, expected, token);
});

test.cb('Ping', t => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}/ping/${stateToken}`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.ping(tenantId, stateId, stateToken, token);
});

test.cb('Get Execution Log', t => {
    t.plan(3);

    const flowId = 'flowId';
    const url = `https://flow.manywho.com/api/log/${flowId}/${stateId}`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getExecutionLog(tenantId, flowId, stateId, token);
});

test.cb('Get Social Me', t => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}/user/me`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getSocialMe(tenantId, streamId, stateId, token);
});

test.cb('Get Social Followers', t => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}/follower`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getSocialFollowers(tenantId, streamId, stateId, token);
});

test.cb('Get Social Messages', t => {
    t.plan(3);

    const streamId = 'streamId';
    const page = 1;
    const pageSize = 10;
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}?page=${page}&pageSize=${pageSize}`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getSocialMessages(tenantId, streamId, stateId, page, pageSize, token);
});

test.cb('Send Social Message', t => {
    t.plan(4);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}/message`;

    const expected = {
        message: 'hello'
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(expected));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.sendSocialMessage(tenantId, streamId, stateId, expected, token);
});

test.cb('Follow', t => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}?follow=true`;

    mock.post(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.follow(tenantId, streamId, stateId, true, token);
});

test.cb('Get Social Users', t => {
    t.plan(3);

    const streamId = 'streamId';
    const name = 'name';
    const url = `https://flow.manywho.com/api/social/1/stream/${streamId}/user?name=${name}`;

    mock.get(url, (req, res) => {
        t.is(req._url, url);
        t.is(req._method, 'GET');
        t.deepEqual(req._headers, expectedStateHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.getSocialUsers(tenantId, streamId, stateId, name, token);
});
