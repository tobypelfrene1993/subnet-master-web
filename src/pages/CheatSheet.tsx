import { Panel } from '../components/Panel';
import { cidrToSubnetMask, cidrToWildcardMask, getBlockSize, getTotalAddresses, getUsableHosts } from '../lib/subnet';

const rows = Array.from({ length: 17 }, (_, index) => index + 16);

export function CheatSheet() {
  return (
    <Panel title="CIDR Cheat Sheet" eyebrow="/16 through /32">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table>
          <thead className="bg-slate-950/70">
            <tr>
              <th>CIDR</th>
              <th>Subnet mask</th>
              <th>Wildcard mask</th>
              <th>Total addresses</th>
              <th>Usable hosts</th>
              <th>Block size</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((cidr) => (
              <tr key={cidr}>
                <td className="font-mono font-semibold text-white">/{cidr}</td>
                <td className="font-mono">{cidrToSubnetMask(cidr)}</td>
                <td className="font-mono">{cidrToWildcardMask(cidr)}</td>
                <td>{getTotalAddresses(cidr).toLocaleString()}</td>
                <td>{getUsableHosts(cidr).toLocaleString()}</td>
                <td>{getBlockSize(cidr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
